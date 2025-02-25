import openmeteo_requests

import requests_cache
import pandas as pd
from retry_requests import retry

######### OPEN METEO API ################

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

# Make sure all required weather variables are listed here
# The order of variables in hourly or daily is important to assign them correctly below
url = "https://climate-api.open-meteo.com/v1/climate"
params = {
	"latitude": 65,
	"longitude": -18,
	"start_date": "2020-01-01",
	"end_date": "2024-12-31",
	"daily": ["temperature_2m_mean", "temperature_2m_max", "temperature_2m_min", "relative_humidity_2m_mean", "relative_humidity_2m_max", "relative_humidity_2m_min", "wind_speed_10m_mean", "wind_speed_10m_max", "cloud_cover_mean", "shortwave_radiation_sum", "rain_sum", "snowfall_sum" ],
}
responses = openmeteo.weather_api(url, params=params)

# Process first location. Add a for-loop for multiple locations or weather models
response = responses[0]
print(f"Coordinates {response.Latitude()}°N {response.Longitude()}°E")
print(f"Elevation {response.Elevation()} m asl")
print(f"Timezone {response.Timezone()} {response.TimezoneAbbreviation()}")
print(f"Timezone difference to GMT+0 {response.UtcOffsetSeconds()} s")

# Process daily data. The order of variables needs to be the same as requested.
daily = response.Daily()
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

daily_data = {"date": pd.date_range(
	start = pd.to_datetime(daily.Time(), unit = "s", utc = True),
	end = pd.to_datetime(daily.TimeEnd(), unit = "s", utc = True),
	freq = pd.Timedelta(seconds = daily.Interval()),
	inclusive = "left"
)}

daily_data["temperature_2m_mean"] = daily_temperature_2m_mean
daily_data["temperature_2m_max"] = daily_temperature_2m_max
daily_data["temperature_2m_min"] = daily_temperature_2m_min
daily_data["relative_humidity_2m_mean"] = daily_relative_humidity_2m_mean
daily_data["relative_humidity_2m_max"] = daily_relative_humidity_2m_max
daily_data["relative_humidity_2m_min"] = daily_relative_humidity_2m_min
daily_data["wind_speed_10m_mean"] = daily_wind_speed_10m_mean
daily_data["wind_speed_10m_max"] = daily_wind_speed_10m_max
daily_data["cloud_cover_mean"] = daily_cloud_cover_mean
daily_data["shortwave_radiation_sum"] = daily_shortwave_radiation_sum
daily_data["rain_sum"] = daily_rain_sum
daily_data["snowfall_sum"] = daily_snowfall_sum


daily_dataframe = pd.DataFrame(data = daily_data)
# print(daily_dataframe)

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


############HUMIDITY###############
# Compute overall averages for the entire period
avg_hum_mean = daily_dataframe["relative_humidity_2m_mean"].mean()
avg_hum_max = daily_dataframe["relative_humidity_2m_max"].mean()
avg_hum_min = daily_dataframe["relative_humidity_2m_min"].mean()

print("\n=== 5-Year Climate Summary ===")
print(f"Average Mean Humidity: {avg_hum_mean:.2f}%")
print(f"Average Max Humidity: {avg_hum_max:.2f}%")
print(f"Average Min Humidity: {avg_hum_min:.2f}%")

# Compute monthly averages (optional)
monthly_avg_hum = daily_dataframe.groupby("month")[["relative_humidity_2m_mean", "relative_humidity_2m_max", "relative_humidity_2m_min"]].mean()

print("\n=== Monthly Climate Averages ===")
print(monthly_avg_hum)

# Compute yearly averages (optional)
yearly_avg_hum = daily_dataframe.groupby("year")[["relative_humidity_2m_mean", "relative_humidity_2m_max", "relative_humidity_2m_min"]].mean()
print("\n=== Yearly Climate Averages ===")
print(yearly_avg_hum)


############WIND SPEED###############

# Compute monthly averages for wind speed
daily_dataframe["wind_speed_10m_mean_mps"] = daily_dataframe["wind_speed_10m_mean"] * 0.27778  # Convert km/h to m/s
daily_dataframe["month"] = daily_dataframe["date"].dt.month

# Group by month and compute average wind speed
monthly_avg_wind = daily_dataframe.groupby("month")["wind_speed_10m_mean_mps"].mean().reset_index()

# Define function to categorize wind speed into Beaufort scale
def classify_wind(speed):
    if speed < 0.3:
        return 0, "Calm"
    elif speed < 1.6:
        return 1, "Light Air"
    elif speed < 3.4:
        return 2, "Light Breeze"
    elif speed < 5.5:
        return 3, "Gentle Breeze"
    elif speed < 8.0:
        return 4, "Moderate Breeze"
    elif speed < 10.8:
        return 5, "Fresh Breeze"
    elif speed < 13.9:
        return 6, "Strong Breeze"
    elif speed < 17.2:
        return 7, "Near Gale"
    elif speed < 20.8:
        return 8, "Gale"
    elif speed < 24.5:
        return 9, "Strong Gale"
    elif speed < 28.5:
        return 10, "Whole Gale"
    elif speed < 32.7:
        return 11, "Storm Force"
    else:
        return 12, "Hurricane Force"
    
# Apply classification function
monthly_avg_wind["Beaufort_number"], monthly_avg_wind["Wind_Description"] = zip(*monthly_avg_wind["wind_speed_10m_mean_mps"].apply(classify_wind))

# Print results
print("\n=== Monthly Average Wind Speed & Beaufort Classification ===")
print(monthly_avg_wind)


############ SKY CONDITIONS (SUNSHINE, CLOUDY, RAIN and SNOW) ###############
# Define thresholds for classification
SUNNY_CLOUD_COVER = 40  # ≤ 45% cloud cover
CLOUDY_CLOUD_COVER = 70  # > 70% cloud cover
HIGH_SUNNY_RADIATION = 15  # Example threshold for high radiation (W/m²)
LOW_SUNNY_RADIATION = 10  # Example threshold for low radiation (W/m²)
RAIN = 2
SNOW = 1


# Compute monthly averages for cloud cover and shortwave radiation
daily_dataframe["month"] = daily_dataframe["date"].dt.month
monthly_avg = daily_dataframe.groupby("month")[["cloud_cover_mean", "shortwave_radiation_sum", "rain_sum", "snowfall_sum"]].mean()

# Classify months based on cloud cover and radiation thresholds
def classify_weather(cloud_cover, radiation, rain, snow):
    if cloud_cover <= SUNNY_CLOUD_COVER and radiation > HIGH_SUNNY_RADIATION: #if cloud cover is less than 40% and radiation is greater than 15
        weather = "Sunny ☀️ "
    elif cloud_cover > CLOUDY_CLOUD_COVER and radiation < LOW_SUNNY_RADIATION: #if cloud cover is greater than 70% and radiation is less than 10
        weather = "Cloudy ☁️ "
    else:
        weather = "Partly Cloudy 🌤 " 

    # Check for rainy conditions
    if rain > RAIN:  # Adjust threshold based on region
        weather += " & Rainy"

    # Check for snowy conditions
    if snow > SNOW:  # Adjust threshold based on region
        weather += " & Snowy"

    return weather
    
# Apply classification function
monthly_avg["Sky Condition"] = monthly_avg.apply(lambda row: classify_weather(row["cloud_cover_mean"], row["shortwave_radiation_sum"], row["rain_sum"], row["snowfall_sum"]), axis = 1)

# Print results
print("\n=== Monthly Sky Condition Classification ===")
print(monthly_avg)