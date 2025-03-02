"""
Flight Track API - Flight Service Module

This module provides core data management and utility functions for the Flight Track API.
It handles data loading, airport information processing, and coordinate mapping services.

Key Features:
- Airport data management and lookups
- Travel advisory data loading and processing
- Visa requirement information handling
- Flight data loading from JSON sources
- Geographic coordinate mapping for airports

Core Functions:
- iata_to_location_info: Converts IATA codes to location details
- load_advisory_data: Retrieves travel advisory information
- load_visa_data: Fetches visa requirement data
- load_flight_data: Loads flight route information
- iata_to_iso: Converts IATA airport codes to ISO country codes
- get_airport_coords: Retrieves airport geographical coordinates

Data Sources:
- Local JSON files for flight data, advisories, and visa information
- OpenFlights airport database for coordinate mapping
- Airportsdata library for IATA code resolution
"""

import os
import json
from typing import Optional
import pandas as pd
import airportsdata
import pycountry



# Load airport data (IATA to ISO country code and city)
airports = airportsdata.load('IATA')


def iata_to_location_info(iata_code):
    """
    Get location information (city, country, ISO code) from IATA code.
    """
    if not iata_code:
        return {"city_name": None, "country_name": None, "iso_code": None}

    airport = airports.get(iata_code.upper())  # Look up IATA code
    if airport:
        iso_code = airport.get("country")  # ISO 2-letter code
        country_name = pycountry.countries.get(alpha_2=iso_code).name if iso_code else None
        city_name = airport.get("city")  # Get city name from dataset
        return {
            "city_name": city_name,
            "country_name": country_name,
            "iso_code": iso_code
        }
    return {"city_name": None, "country_name": None, "iso_code": None}

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