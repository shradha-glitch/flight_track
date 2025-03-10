"""
Flight Track API - Main Application Entry Point

This module serves as the main entry point for the Flight Track API application.
It initializes the FastAPI application, sets up CORS middleware for frontend
communication, and configures the API routes.

Key Components:
- FastAPI application initialization
- CORS middleware configuration for frontend integration
- API route registration for flight data and weather information
- Root endpoint for API health check

The application exposes RESTful api endpoints under the '/api' prefix for flight
tracking and weather advisory data operations.
"""
from fastapi import FastAPI, HTTPException
from app.flight_controller import router as flight_router
from fastapi.middleware.cors import CORSMiddleware


# Initialize FastAPI app
app = FastAPI()

# Include the flight router
app.include_router(flight_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Welcome to the Flight Data and Weather API!"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://flight-track-1.onrender.com",
        "https://flight-track-73i5c1cer-shradhas-projects-61f0747a.vercel.app",
        "https://flight-track-xi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)