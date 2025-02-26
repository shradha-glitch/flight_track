from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.flight_controller import router as flight_router
from typing import Optional
import pandas as pd
import requests_cache
import openmeteo_requests
from retry_requests import retry
import matplotlib.pyplot as plt
import requests
import os

# Initialize FastAPI app
app = FastAPI()

# Enable CORS to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this with your frontend's URL if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include the flight router
app.include_router(flight_router, prefix="/api")

# Load airport data for coordinates
AIRPORTS_URL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat"
AIRPORTS_COLUMNS = [
    "ID", "Name", "City", "Country", "IATA", "ICAO", "Latitude", "Longitude",
    "Altitude", "Timezone", "DST", "TZ_DB", "Type", "Source"
]

# Load airports data into a DataFrame
airports_df = pd.read_csv(AIRPORTS_URL, names=AIRPORTS_COLUMNS, header=None)

# Function to get airport coordinates by IATA code
def get_airport_coords(iata_code: str) -> Optional[tuple[float, float]]:
    """
    Get latitude and longitude for an airport by IATA code.
    """
    airport = airports_df[airports_df["IATA"] == iata_code]
    if not airport.empty:
        return float(airport.iloc[0]["Latitude"]), float(airport.iloc[0]["Longitude"])
    return None

# Setup Open-Meteo API client with cache and retry
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

@app.get("/weather/{iata_code}")
async def get_weather(iata_code: str):
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
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "daily": "temperature_2m_mean"
    }
    responses = openmeteo.weather_api(url, params=params)

    if not responses:
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")

    response = responses[0]
    daily = response.Daily()
    daily_temperature_2m_mean = daily.Variables(0).ValuesAsNumpy()

    # Prepare weather data
    weather_data = {
        "dates": pd.date_range(
            start=pd.to_datetime(daily.Time(), unit="s", utc=True),
            end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=daily.Interval()),
            inclusive="left"
        ).tolist(),
        "temperature_2m_mean": daily_temperature_2m_mean.tolist()
    }

    return weather_data

@app.get("/api/advisory/{country_code}")
async def get_advisory(country_code: str):
    """
    Fetch travel advisory data from local backend for the given country code.
    """
    # Make a request to your local backend API
    url = f"http://127.0.0.1:8001/api/advisory/{country_code.lower()}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch advisory data: {e}")

    data = response.json()

    # Check if advisory data exists for the country code
    if "country_code" in data and data["country_code"] == country_code.upper():
        return data  # Return the advisory data from the local backend
    else:
        raise HTTPException(status_code=404, detail="No advisory data found for this country code.")

@app.get("/api/flights/forlondon")
async def get_flights_for_london():
    """
    Get flight data for London.
    """
    # Make a request to your local backend API
    url = "http://127.0.0.1:8001/api/flights/forlondon?origin=LGW"

    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch flight data: {e}")
        
@app.get("/")
async def root():
    return {"message": "Welcome to the Flight Data and Weather API!"}
