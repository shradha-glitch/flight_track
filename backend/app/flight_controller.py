"""
Flight Track API - Flight Controller Module

This module handles all the route definitions and controller logic for the Flight Track API.
It manages various endpoints related to flights, travel advisories, visa requirements, and
weather information.

Key Features:
- Flight data retrieval and filtering for London routes
- Travel advisory information for different countries
- Visa requirement lookups by country
- Weather forecast data for airports
- Destination-specific travel advisories

Endpoints:
- /flights/forlondon: Retrieve and filter flight data
- /advisory/{country_code}: Get travel advisory for specific countries
- /visa/{country_code}: Access visa requirements
- /destinations/travel-advisory: Get consolidated travel advisories
- /weather/{iata_code}: Fetch weather forecasts for airports

The module integrates with external services including Open-Meteo API for weather data
and uses caching mechanisms to optimize API performance.
"""

from fastapi import APIRouter, HTTPException, Query
from .flight_service import load_flight_data, load_advisory_data, load_visa_data, iata_to_iso, get_airport_coords, iata_to_location_info
import requests_cache
import openmeteo_requests
from retry_requests import retry
import numpy as np
from datetime import datetime

router = APIRouter()



"""
@endpoint: GET /api/flights/forlondon
@description: Get flights data with optional origin and destination filters
@parameters:
    - origin (optional): IATA code of origin airport
    - destination (optional): IATA code of destination airport
@usage: 
    - All flights: curl http://localhost:8000/api/flights/forlondon
    - Filtered: curl http://localhost:8000/api/flights/forlondon?origin=LHR&destination=JFK
"""
@router.get("/flights/forlondon")
async def get_flights_by_origin(origin: str = None, destination: str = None, departure_date: str = None):
    """
    Get flights data. Optionally filter by origin and destination.
    """

    flights = load_flight_data()
    if not flights:
        raise HTTPException(status_code=404, detail="No flight data found")

    if origin:
        flights = [f for f in flights if f["origin"] == origin]
    if destination:
        flights = [f for f in flights if f["destination"] == destination]
    if departure_date:
        flights = [f for f in flights if f["departureDate"] == departure_date]

    for flight in flights:
        location_info = iata_to_location_info(flight["destination"])

        departure = datetime.strptime(flight["departureDate"], "%Y-%m-%d")
        return_date = datetime.strptime(flight["returnDate"], "%Y-%m-%d")
        travel_days = (return_date - departure).days

        location_info["travel_days"] = travel_days
        flight["destination_info"] = location_info

    return flights


"""
@endpoint: GET /api/advisory/{country_code}
@description: Get travel advisory for a specific country
@parameters:
    - country_code: ISO country code (e.g., 'us', 'gb')
@usage: curl http://localhost:8000/api/advisory/us
"""
@router.get("/advisory/{country_code}")
async def get_advisory(country_code: str):
    """
    Get travel advisory for a specific country.
    """
    advisories = load_advisory_data()
    if not advisories:
        raise HTTPException(status_code=404, detail="Advisory data not found")

    advisory = advisories.get(country_code.lower())
    if not advisory:
        raise HTTPException(status_code=404, detail=f"No advisory found for country code {country_code}")

    return advisory

"""
@endpoint: GET /api/pcpvisa
@description: Get visa requirements for multiple countries with optional departure date filter
@parameters:
    - country_codes: Comma-separated list of ISO country codes (uppercase, e.g., 'US,GB,FR')
    - departure_date: Optional date filter (YYYY-MM-DD)
@usage: 
    - All dates: curl http://localhost:8000/api/pcpvisa?country_codes=US,GB,FR
    - Specific date: curl http://localhost:8000/api/pcpvisa?country_codes=US,GB,FR&departure_date=2025-03-11
"""
@router.get("/pcpvisa")
async def get_visa_requirements(
        country_codes: str = Query(..., description="Comma-separated list of country codes"),
        departure_date: str = Query(None, description="Optional departure date filter (YYYY-MM-DD)")
):
    """
    Get visa requirements for multiple countries.
    """
    visa_data = load_visa_data()
    if not visa_data:
        raise HTTPException(status_code=404, detail="Visa data not found")

    flights = load_flight_data()
    if not flights:
        raise HTTPException(status_code=404, detail="No flight data found")

    if departure_date:
        flights = [f for f in flights if f["departureDate"] == departure_date]

    destination_visa_map = {}
    for flight in flights:
        location_info = iata_to_location_info(flight["destination"])

        departure = datetime.strptime(flight["departureDate"], "%Y-%m-%d")
        return_date = datetime.strptime(flight["returnDate"], "%Y-%m-%d")
        travel_days = (return_date - departure).days

        location_info["travel_days"] = travel_days
        flight["destination_info"] = location_info

        destination_iso = location_info["iso_code"]

        destination_requirements = {}
        for origin_country in country_codes.split(','):
            origin_country = origin_country.strip().upper()
            if origin_country in visa_data:
                destination_requirements[origin_country] = visa_data[origin_country].get(destination_iso, "Unknown")

        if destination_requirements: 
            destination_visa_map[flight["destination"]] = destination_requirements

    return {
        "destination_requirements": destination_visa_map,
        "total_destinations": len(destination_visa_map),
        "departure_date": departure_date
    }


"""
@endpoint: GET /api/visa
@description: Get visa requirements for multiple countries
@parameters:
    - country_codes: Comma-separated list of ISO country codes (uppercase, e.g., 'US,GB,FR')
@usage: curl http://localhost:8000/api/visa?country_codes=US,GB,FR
"""
@router.get("/visa")
async def get_visa_requirements(country_codes: str = Query(..., description="Comma-separated list of country codes")):
    """
    Get visa requirements for multiple countries.
    """
    visa_data = load_visa_data()
    if not visa_data:
        raise HTTPException(status_code=404, detail="Visa data not found")

    codes = [code.strip().upper() for code in country_codes.split(",")]

    requirements = {}
    for code in codes:
        requirement = visa_data.get(code)
        if requirement:
            requirements[code] = requirement
        else:
            requirements[code] = None

    return {
        "requirements": requirements,
        "total_requested": len(codes),
        "found": len([r for r in requirements.values() if r is not None])
    }

"""
@endpoint: GET /api/destinations/travel-advisory
@description: Get travel advisories for all destinations in flight data
@usage: curl http://localhost:8000/api/destinations/travel-advisory
"""
@router.get("/destinations/travel-advisory")
async def get_travel_advisory():
    """
    Get travel advisories for destinations in Lon-other.json
    """
    flights_data = load_flight_data()
    if not flights_data:
        raise HTTPException(status_code=404, detail="Flight data not found")

    advisories = load_advisory_data()
    if not advisories:
        raise HTTPException(status_code=404, detail="Advisory data not found")

    destinations = {flight["destination"] for flight in flights_data}

    destination_advisories = {}
    unmatched = []

    for iata in destinations:
        country_code = iata_to_iso(iata)
        if country_code and country_code.lower() in advisories:
            destination_advisories[iata] = {
                "iata": iata,
                "iso": country_code.lower(), 
                "advisory": advisories[country_code.lower()]
            }
        else:
            unmatched.append(iata)

    return {
        "advisories": destination_advisories,
        "unmatched": unmatched,
        "total_destinations": len(destinations),
        "matched_destinations": len(destination_advisories)
    }


cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

"""
@endpoint: GET /api/weather/{iata_code}
@description: Get weather forecast for an airport
@parameters:
    - iata_code: Airport IATA code
    - departure_date: Start date (YYYY-MM-DD)
    - return_date: End date (YYYY-MM-DD)
@usage: curl http://localhost:8000/api/weather/LHR?departure_date=2024-01-01&return_date=2024-01-07
"""
@router.get("/weather/{iata_code}")
async def get_weather(iata_code: str, departure_date: str = Query(...), return_date: str = Query(...)):
    """
    Get weather forecast for an airport by IATA code.
    """
    coords = get_airport_coords(iata_code)
    if not coords:
        raise HTTPException(status_code=404, detail=f"Airport with IATA code {iata_code} not found")

    latitude, longitude = coords

    url = "https://climate-api.open-meteo.com/v1/climate"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": departure_date,
        "end_date": return_date,
        "daily": ["temperature_2m_mean", "cloud_cover_mean", "shortwave_radiation_sum", "rain_sum", "snowfall_sum"]
    }
    responses = openmeteo.weather_api(url, params=params)

    if not responses:
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")

    response = responses[0]
    daily = response.Daily()
    daily_temperature_2m_mean = daily.Variables(0).ValuesAsNumpy()
    daily_cloud_cover_mean = daily.Variables(1).ValuesAsNumpy()
    daily_shortwave_radiation_sum = daily.Variables(2).ValuesAsNumpy()
    daily_rain_sum = daily.Variables(3).ValuesAsNumpy()
    daily_snowfall_sum = daily.Variables(4).ValuesAsNumpy()

    def safe_float(value):
        if np.isnan(value) or np.isinf(value):
            return None
        return float(value)

    average_temperature = safe_float(np.mean(daily_temperature_2m_mean))
    avg_cloud_cover = safe_float(np.mean(daily_cloud_cover_mean))
    avg_radiation = safe_float(np.mean(daily_shortwave_radiation_sum))
    avg_rain = safe_float(np.mean(daily_rain_sum))
    avg_snow = safe_float(np.mean(daily_snowfall_sum))

    rainy_days = safe_float(np.sum(daily_rain_sum > 1.0))
    snowy_days = safe_float(np.sum(daily_snowfall_sum > 0.1))
    sunny_days = safe_float(np.sum((daily_cloud_cover_mean < 20) & (daily_shortwave_radiation_sum > 15)))
    cloudy_days = safe_float(np.sum(daily_cloud_cover_mean > 50))
    partly_cloudy_days = safe_float(np.sum((daily_cloud_cover_mean >= 20) & (daily_cloud_cover_mean <= 50)))

    weather_conditions = {
        "Rainy": rainy_days or 0, 
        "Snowy": snowy_days or 0,
        "Sunny": sunny_days or 0,
        "Cloudy": cloudy_days or 0,
        "Partly Clouded": partly_cloudy_days or 0
    }

    dominant_weather = max(weather_conditions.items(), key=lambda x: x[1])
    weather_summary = dominant_weather[0]

    def safe_list(arr):
        return [safe_float(x) or 0 for x in arr] 

    daily_temperature_2m_mean = safe_list(daily_temperature_2m_mean)
    daily_cloud_cover_mean = safe_list(daily_cloud_cover_mean)
    daily_shortwave_radiation_sum = safe_list(daily_shortwave_radiation_sum)
    daily_rain_sum = safe_list(daily_rain_sum)
    daily_snowfall_sum = safe_list(daily_snowfall_sum)

    total_days = float(len(daily_temperature_2m_mean))
    weather_data = {
        "average_temperature": round(average_temperature or 0, 1), 
        "dominant_climate": weather_summary,
        "daily_temperature": daily_temperature_2m_mean,
        "daily_cloud_cover": daily_cloud_cover_mean,
        "daily_radiation_sum": daily_shortwave_radiation_sum,
        "daily_rain_sum": daily_rain_sum,
        "daily_snowfall_sum": daily_snowfall_sum,
        "weather_breakdown": {
            condition: {
                "days": int(days),
                "percentage": round((days / total_days * 100) if days and total_days else 0, 1)
            } for condition, days in weather_conditions.items() if days > 0
        }
    }

    return weather_data


"""
@endpoint: GET /api/neo_weather
@description: Get weather forecast for all destinations with flights on a specific departure date
@parameters:
    - departure_date: Departure date (YYYY-MM-DD)
@usage: curl http://localhost:8000/api/neo_weather?departure_date=2025-03-11
"""
@router.get("/neooneweather")
async def get_weather(departure_date: str = Query(...)):
    """
    Get weather forecast for all destinations with flights on the specified departure date.
    """
    flights = load_flight_data()
    if not flights:
        raise HTTPException(status_code=404, detail="No flight data found")

    if departure_date:
        flights = [f for f in flights if f["departureDate"] == departure_date]

    destination_weather_map = {}

    for flight in flights:
        destination = flight["destination"]

        if destination in destination_weather_map:
            continue

        coords = get_airport_coords(destination)
        if not coords:
            continue 

        latitude, longitude = coords
        return_date = flight["returnDate"]

        url = "https://climate-api.open-meteo.com/v1/climate"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": departure_date,
            "end_date": return_date,
            "daily": ["temperature_2m_mean", "cloud_cover_mean", "shortwave_radiation_sum", "rain_sum", "snowfall_sum"]
        }

        try:
            responses = openmeteo.weather_api(url, params=params)

            if not responses:
                continue 

            response = responses[0]
            daily = response.Daily()
            daily_temperature_2m_mean = daily.Variables(0).ValuesAsNumpy()
            daily_cloud_cover_mean = daily.Variables(1).ValuesAsNumpy()
            daily_shortwave_radiation_sum = daily.Variables(2).ValuesAsNumpy()
            daily_rain_sum = daily.Variables(3).ValuesAsNumpy()
            daily_snowfall_sum = daily.Variables(4).ValuesAsNumpy()

            def safe_float(value):
                if np.isnan(value) or np.isinf(value):
                    return None
                return float(value)

            average_temperature = safe_float(np.mean(daily_temperature_2m_mean))

            rainy_days = safe_float(np.sum(daily_rain_sum > 1.0))
            snowy_days = safe_float(np.sum(daily_snowfall_sum > 0.1))
            sunny_days = safe_float(np.sum((daily_cloud_cover_mean < 20) & (daily_shortwave_radiation_sum > 15)))
            cloudy_days = safe_float(np.sum(daily_cloud_cover_mean > 50))
            partly_cloudy_days = safe_float(np.sum((daily_cloud_cover_mean >= 20) & (daily_cloud_cover_mean <= 50)))

            weather_conditions = {
                "Rainy": rainy_days or 0,
                "Snowy": snowy_days or 0,
                "Sunny": sunny_days or 0,
                "Cloudy": cloudy_days or 0,
                "Partly Clouded": partly_cloudy_days or 0
            }

            dominant_weather = max(weather_conditions.items(), key=lambda x: x[1])
            weather_summary = dominant_weather[0]

            def safe_list(arr):
                return [safe_float(x) or 0 for x in arr]

            daily_temperature_2m_mean = safe_list(daily_temperature_2m_mean)
            daily_cloud_cover_mean = safe_list(daily_cloud_cover_mean)
            daily_shortwave_radiation_sum = safe_list(daily_shortwave_radiation_sum)
            daily_rain_sum = safe_list(daily_rain_sum)
            daily_snowfall_sum = safe_list(daily_snowfall_sum)

            total_days = float(len(daily_temperature_2m_mean))

            destination_weather_map[destination] = {
                "average_temperature": round(average_temperature or 0, 1),
                "dominant_climate": weather_summary,
                "daily_temperature": daily_temperature_2m_mean,
                "daily_cloud_cover": daily_cloud_cover_mean,
                "daily_radiation_sum": daily_shortwave_radiation_sum,
                "daily_rain_sum": daily_rain_sum,
                "daily_snowfall_sum": daily_snowfall_sum,
                "weather_breakdown": {
                    condition: {
                        "days": int(days),
                        "percentage": round((days / total_days * 100) if days and total_days else 0, 1)
                    } for condition, days in weather_conditions.items() if days > 0
                }
            }
        except Exception as e:
            continue

    return {
        "departure_date": departure_date,
        "destinations": destination_weather_map,
        "total_destinations": len(destination_weather_map)
    }
