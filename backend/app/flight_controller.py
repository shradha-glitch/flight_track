from fastapi import APIRouter, HTTPException, Query
from .flight_service import load_flight_data, load_advisory_data, load_visa_data, iata_to_iso, get_airport_coords
import requests_cache
import openmeteo_requests
from retry_requests import retry
import pandas as pd
import numpy as np

router = APIRouter()


@router.get("/flights/forlondon")
async def get_flights_by_origin(origin: str = None, destination: str = None):
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

    return flights


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


@router.get("/visa/{country_code}")
async def get_visa_requirements(country_code: str):
    """
    Get visa requirements for a specific country.
    """
    visa_data = load_visa_data()
    if not visa_data:
        raise HTTPException(status_code=404, detail="Visa data not found")

    requirements = visa_data.get(country_code.upper())
    if not requirements:
        raise HTTPException(status_code=404, detail=f"No visa requirements found for country code {country_code}")

    return requirements


@router.get("/destinations/travel-advisory")
async def get_travel_advisory():
    """
    Get travel advisories for destinations in Lon-other.json
    """
    # Load flight data
    flights_data = load_flight_data()
    if not flights_data:
        raise HTTPException(status_code=404, detail="Flight data not found")

    # Load advisory data
    advisories = load_advisory_data()
    if not advisories:
        raise HTTPException(status_code=404, detail="Advisory data not found")

    # Get unique destinations
    destinations = {flight["destination"] for flight in flights_data}

    # Map destinations to advisories
    destination_advisories = {}
    unmatched = []

    for iata in destinations:
        # Convert IATA to ISO country code
        country_code = iata_to_iso(iata)
        if country_code and country_code.lower() in advisories:
            destination_advisories[iata] = {
                "iata": iata,
                "iso": country_code.lower(),  # Add ISO code
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


# Setup Open-Meteo API client with cache and retry
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)


@router.get("/weather/{iata_code}")
async def get_weather(iata_code: str, departure_date: str = Query(...), return_date: str = Query(...)):
    """
    Get weather forecast for an airport by IATA code.
    """
    coords = get_airport_coords(iata_code)
    if not coords:
        raise HTTPException(status_code=404, detail=f"Airport with IATA code {iata_code} not found")

    latitude, longitude = coords

    # Fetch weather data from Open-Meteo API
    url = "https://climate-api.open-meteo.com/v1/climate"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": departure_date,
        "end_date": return_date,
        "daily": "temperature_2m_mean"
    }
    responses = openmeteo.weather_api(url, params=params)

    if not responses:
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")

    response = responses[0]
    daily = response.Daily()
    daily_temperature_2m_mean = daily.Variables(0).ValuesAsNumpy()

    # Calculate the average temperature over the date range
    average_temperature = float(np.mean(daily_temperature_2m_mean))

    # Prepare weather data
    weather_data = {
        "average_temperature": average_temperature
    }

    return weather_data
