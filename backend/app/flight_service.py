import os
import json

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