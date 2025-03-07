import React from 'react';
import CustomCard from "./Card";
import { Box, Typography, Divider } from "@mui/material";
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';

const WeatherCard = ({ selectedDestination }) => {
    // Function to get the appropriate weather icon
    const getWeatherIcon = (weather) => {
        switch(weather) {
            case 'Sunny':
                return <WbSunnyIcon sx={{ fontSize: 40, color: '#FFD700' }} />;
            case 'Partly Clouded':
                return <FilterDramaIcon sx={{ fontSize: 40, color: '#87CEEB' }} />;
            case 'Cloudy':
                return <CloudIcon sx={{ fontSize: 40, color: '#A9A9A9' }} />;
            case 'Rainy':
                return <ThunderstormIcon sx={{ fontSize: 40, color: '#4682B4' }} />;
            case 'Snowy':
                return <AcUnitIcon sx={{ fontSize: 40, color: '#E0FFFF' }} />;
            default:
                return <WbSunnyIcon sx={{ fontSize: 40, color: '#FFD700' }} />;
        }
    };

    return (
        <CustomCard>
            <Box sx={{ 
                height: '500px',
                display: 'flex',
                flexDirection: 'column',
                p: 3
            }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                    Weather Information
                </Typography>
                
                {!selectedDestination ? (
                    <Typography color="text.secondary">Select a destination to view weather details</Typography>
                ) : (
                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <Typography variant="h5" fontWeight="bold">
                                {selectedDestination.destination_info.city_name}, {selectedDestination.destination_info.country_name}
                            </Typography>
                        </Box>
                        
                        <Divider />
                        
                        <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mt: 2
                        }}>
                            {getWeatherIcon(selectedDestination.pcp?.weather)}
                            <Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {selectedDestination.pcp?.temp}°C
                                </Typography>
                                <Typography variant="body1">
                                    {selectedDestination.pcp?.weather || 'Unknown'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                Trip Details
                            </Typography>
                            
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Departure
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedDestination.departureDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Return
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedDestination.returnDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Duration
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedDestination.pcp?.duration || 'N/A'} days
                                    </Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Price
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        £{selectedDestination.price?.total || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </CustomCard>
    );
};

export default WeatherCard;