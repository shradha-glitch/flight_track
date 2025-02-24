from fastapi import FastAPI, HTTPException
from app.flight_controller import router as flight_router
from typing import Optional
import pandas as pd
import requests_cache
import openmeteo_requests
from retry_requests import retry
import matplotlib.pyplot as plt
import os

# Initialize FastAPI app
app = FastAPI()

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

@app.get("/")
async def root():
    return {"message": "Welcome to the Flight Data and Weather API!"}
