from fastapi import FastAPI, HTTPException
from app.flight_controller import router as flight_router
from fastapi.middleware.cors import CORSMiddleware
import requests

# Initialize FastAPI app
app = FastAPI()

# Include the flight router
app.include_router(flight_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Welcome to the Flight Data and Weather API!"}



# Enable CORS to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this with your frontend's URL if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# We need to refine this correctly later.
@app.get("/api/advisory/{country_code}")
async def get_advisory(country_code: str):
    """
    Fetch travel advisory data from local backend for the given country code.
    """
    # Make a request to your local backend API
    url = f"http://127.0.0.1:8000/api/advisory/{country_code.lower()}"

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
