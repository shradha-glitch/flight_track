# from fastapi import APIRouter, HTTPException
# from .flight_service import load_flight_data
# import json

# router = APIRouter()
# # print(flight_service)

# @router.get("/flights/forlondon")
# async def get_flights_by_origin():
#     print("Endpoint called!")  # Debug line
#     try:
#         print("About to load flight data")
#         flights = load_flight_data()
#         print(f"Data loaded: {bool(flights)}")
#         if not flights:
#             raise HTTPException(status_code=404, detail="No flight data found")
#         return flights
#     except FileNotFoundError:
#         raise HTTPException(status_code=404, detail="Flight data file not found")
#     except json.JSONDecodeError:
#         raise HTTPException(status_code=500, detail="Error parsing flight data")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))/







from fastapi import APIRouter, HTTPException
from .flight_service import load_flight_data, load_advisory_data, load_visa_data

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