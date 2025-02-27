import os
import json
import airportsdata
from typing import Optional
import pandas as pd


def load_advisory_data():
    """
    Load travel advisory data from countries-advisory.json.
    """
    try:
        file_path = os.path.join(os.path.dirname(__file__), "..", "data", "countries-advisory.json")
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def load_visa_data():
    """
    Load visa requirements data from visa-countries.json.
    """
    try:
        file_path = os.path.join(os.path.dirname(__file__), "..", "data", "visa-countries.json")
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def load_flight_data():
    try:
        file_path = os.path.join(os.path.dirname(__file__), "..", "data", "Lon-other.json")
        print(f"Looking for file at: {file_path}")  # Debug line
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)["data"]
            if not data:
                return None
            return data
    except FileNotFoundError:
        print("File not found!")  # Debug line
        return None
    except json.JSONDecodeError:
        print("Invalid JSON file!")  # Debug line
        return None


# Load airport data (includes IATA and country codes)
airports = airportsdata.load('IATA')


def iata_to_iso(iata_code):
    airport = airports.get(iata_code.upper())  # Look up IATA code
    return airport['country'] if airport else None  # Return ISO country code


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