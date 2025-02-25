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
        "daily": ["temperature_2m_mean", "temperature_2m_max", "temperature_2m_min", "relative_humidity_2m_mean", "relative_humidity_2m_max", "relative_humidity_2m_min", "wind_speed_10m_mean", "wind_speed_10m_max", "cloud_cover_mean", "shortwave_radiation_sum", "rain_sum", "snowfall_sum" ],
    }
    responses = openmeteo.weather_api(url, params=params)

    if not responses:
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")

    response = responses[0] # Process first location. Add a for-loop for multiple locations or weather models
    daily = response.Daily() # Process daily data. The order of variables needs to be the same as requested.
    daily_temperature_2m_mean = daily.Variables(0).ValuesAsNumpy()
    daily_temperature_2m_max = daily.Variables(1).ValuesAsNumpy()
    daily_temperature_2m_min = daily.Variables(2).ValuesAsNumpy()
    daily_relative_humidity_2m_mean = daily.Variables(3).ValuesAsNumpy()
    daily_relative_humidity_2m_max = daily.Variables(4).ValuesAsNumpy()
    daily_relative_humidity_2m_min = daily.Variables(5).ValuesAsNumpy()
    daily_wind_speed_10m_mean = daily.Variables(6).ValuesAsNumpy()
    daily_wind_speed_10m_max = daily.Variables(7).ValuesAsNumpy()
    daily_cloud_cover_mean = daily.Variables(8).ValuesAsNumpy()
    daily_shortwave_radiation_sum = daily.Variables(9).ValuesAsNumpy()
    daily_rain_sum = daily.Variables(10).ValuesAsNumpy()
    daily_snowfall_sum = daily.Variables(11).ValuesAsNumpy()

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
    

    def temperature(daily_dataframe: pd.DataFrame):
        ######TEMPERATURES###############
        # Compute overall averages for the entire period
        avg_temp_mean = daily_dataframe["temperature_2m_mean"].mean()
        avg_temp_max = daily_dataframe["temperature_2m_max"].mean()
        avg_temp_min = daily_dataframe["temperature_2m_min"].mean()

        print("\n=== 5-Year Climate Summary ===")
        print(f"Average Mean Temperature: {avg_temp_mean:.2f}°C")
        print(f"Average Max Temperature: {avg_temp_max:.2f}°C")
        print(f"Average Min Temperature: {avg_temp_min:.2f}°C")

        # Compute monthly averages (optional)
        daily_dataframe["month"] = daily_dataframe["date"].dt.month
        monthly_avg = daily_dataframe.groupby("month")[["temperature_2m_mean", "temperature_2m_max", "temperature_2m_min"]].mean()

        print("\n=== Monthly Climate Averages ===")
        print(monthly_avg)

        # Compute yearly averages (optional)
        daily_dataframe["year"] = daily_dataframe["date"].dt.year
        yearly_avg = daily_dataframe.groupby("year")[["temperature_2m_mean", "temperature_2m_max", "temperature_2m_min"]].mean()

        print("\n=== Yearly Climate Averages ===")
        print(yearly_avg)

    return weather_data

@app.get("/")
async def root():
    return {"message": "Welcome to the Flight Data and Weather API!"}
