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
                        {destinations.map((destination, index) => (
                            <li 
                                key={index}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                {destination}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </CustomCard>
    );
};

export default ResultsCard;