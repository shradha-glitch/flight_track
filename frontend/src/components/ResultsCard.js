import React, { useRef, useEffect } from 'react';
import CustomCard from "./card/Card";
import { Box, Typography, Divider, Avatar, Radio } from "@mui/material";

const ResultsCard = ({ destinations = [], onSelectDestination, selectedDestination }) => {
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (selectedDestination && scrollContainerRef.current) {
            const selectedElement = scrollContainerRef.current.querySelector(
                `[data-destination="${selectedDestination.destination}"]`
            );
            
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [selectedDestination]);

    return (
        <CustomCard>
            <Box sx={{ 
                height: '550px',
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
                    <Typography color="text.secondary">Search and filter flights to view the results listed here</Typography>
                ) : (
                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ 
                            backgroundColor: 'white',
                            zIndex: 10,
                            pb: 1
                        }}>
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: '0.2fr 1.5fr 1fr 1fr 1fr',
                                mb: 1
                            }}>
                                <Typography fontWeight="medium"></Typography>
                                <Typography fontWeight="medium">Destination</Typography>
                                <Typography fontWeight="medium">Departure</Typography>
                                <Typography fontWeight="medium">Return</Typography>
                                <Typography fontWeight="medium">Price</Typography>
                            </Box>
                            <Divider />
                        </Box>
                        
                        <Box 
                            ref={scrollContainerRef}
                            sx={{ 
                                overflowY: 'auto',
                                flexGrow: 1,
                                mt: 1
                        }}>
                            {destinations.map((flight, index) => (
                                <Box 
                                    key={index}
                                    data-destination={flight.destination} 
                                    onClick={() => onSelectDestination(flight)}
                                    sx={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '0.2fr 1.5fr 1fr 1fr 1fr',
                                        py: 1.5,
                                        borderBottom: '1px solid #eee',
                                        alignItems: 'center',
                                        opacity: selectedDestination && selectedDestination.destination !== flight.destination ? 0.6 : 1,
                                        transition: 'opacity 0.2s ease',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                            opacity: 1
                                        }
                                }}>
                                    <Radio
                                        checked={selectedDestination?.destination === flight.destination}
                                        onChange={() => onSelectDestination(flight)}
                                        value={flight.destination}
                                        name="destination-radio-button"
                                        size="small"
                                    />
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