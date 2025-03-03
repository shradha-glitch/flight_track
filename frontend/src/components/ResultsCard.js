import React from 'react';
import CustomCard from "./card/Card";

const ResultsCard = ({ destinations = [] }) => {
    return (
        <CustomCard>
            <div style={{
                height: '400px',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '1rem'
            }}>
                <h3 className="text-lg font-semibold mb-4">Filtered Destinations</h3>
                {destinations.length === 0 ? (
                    <p className="text-gray-500">No destinations selected</p>
                ) : (
                    <ul className="space-y-2">
                        {destinations.map((flight, index) => (
                            <li 
                                key={index}
                                className="p-3 hover:bg-gray-100 rounded border border-gray-200"
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="font-semibold">{flight.destination_info.city_name}, {flight.destination_info.iso_code}</div>
                                    <div className="text-sm text-gray-600">
                                        <div>Price: ${flight.price?.total || 'N/A'}</div>
                                        <div>Temperature: {flight.pcp?.temp ? `${flight.pcp.temp.toFixed(1)}°C` : 'N/A'}</div>
                                        <div>Weather Score: {flight.pcp?.weather ? flight.pcp.weather.toFixed(1) : 'N/A'}</div>
                                        <div>Safety: {flight.pcp?.safety || 'N/A'}</div>
                                        <div>Visa Required: {flight.pcp?.visa !== undefined ? (flight.pcp.visa ? "Yes" : "No") : 'N/A'}</div>
                                        <div>Flight Duration: {flight.pcp?.duration ? `${flight.pcp.duration.toFixed(1)} hours` : 'N/A'}</div>
                                        <div>Departure: {flight.departureDate ? new Date(flight.departureDate).toLocaleDateString() : 'N/A'}</div>
                                        <div>Return: {flight.returnDate ? new Date(flight.returnDate).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </CustomCard>
    );
};

export default ResultsCard;