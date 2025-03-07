import React from 'react';
import CustomCard from "./card/Card";
import { Box, Typography, Divider, Avatar } from "@mui/material";

const ResultsCard = ({ destinations = [] }) => {
    return (
        <CustomCard>
            <Box sx={{ 
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                p: 3
            }}>
                {destinations.length === 0 ? (
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                        Filtered Destinations
                    </Typography>
                ) : null}
                
                {destinations.length === 0 ? (
                    <Typography color="text.secondary">No destinations selected</Typography>
                ) : (
                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        overflow: 'hidden'
                    }}>
                        {/* Fixed Header */}
                        <Box sx={{ 
                            backgroundColor: 'white',
                            zIndex: 10,
                            pb: 1
                        }}>
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                                mb: 1
                            }}>
                                <Typography fontWeight="medium">Destination</Typography>
                                <Typography fontWeight="medium">Departure</Typography>
                                <Typography fontWeight="medium">Return</Typography>
                                <Typography fontWeight="medium">Price</Typography>
                            </Box>
                            <Divider />
                        </Box>
                        
                        {/* Scrollable Content */}
                        <Box sx={{ 
                            overflowY: 'auto',
                            flexGrow: 1,
                            mt: 1
                        }}>
                            {destinations.map((flight, index) => (
                                <Box key={index} sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                                    py: 1.5,
                                    borderBottom: '1px solid #eee',
                                    alignItems: 'center'
                                }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2
                                    }}>
                                        <Avatar
                                            src={`https://countryflagsapi.netlify.app/flag/${flight.destination_info.iso_code.toLowerCase()}.svg`}
                                            alt={flight.destination_info.city_name}
                                            sx={{ width: 24, height: 24 }}
                                        />
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {flight.destination_info.city_name}, {flight.destination_info.iso_code}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {flight.origin} - {flight.destination}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography>
                                        {new Date(flight.departureDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </Typography>
                                    <Typography>
                                        {new Date(flight.returnDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </Typography>
                                    <Typography fontWeight="medium">
                                        £{flight.price?.total || 'N/A'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        </CustomCard>
    );
};

export default ResultsCard;