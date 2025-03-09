import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import CustomCard from "./Card";
import { Box, Typography, Divider, Avatar } from "@mui/material";

import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';


const WeatherCard = ({ selectedDestination }) => {
    const svgRef = useRef();
    const [weatherData, setWeatherData] = useState(null);


    useEffect(() => {
        if (!selectedDestination) return;

        const fetchWeatherData = async () => {
            const { destination, departureDate, returnDate } = selectedDestination;
            const apiUrl = `https://flight-track.onrender.com/api/weather/${destination}?departure_date=${departureDate}&return_date=${returnDate}`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error("Failed to fetch weather data");
                const data = await response.json();
                console.log("Fetched Weather Data:", data);

                if (data.daily_temperature) {
                    setWeatherData(data.daily_temperature);
                } else {
                    console.warn("No daily temperature data found in API response");
                    setWeatherData(null);
                }
            } catch (error) {
                console.error("Error fetching weather data:", error);
                setWeatherData(null);
            }
        };

        fetchWeatherData();
    }, [selectedDestination]);

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

    useEffect(() => {
        console.log("useEffect triggered, selectedDestination:", selectedDestination);
        if (!weatherData || !selectedDestination) return;

        const startDate = new Date(selectedDestination.departureDate);
        const endDate = new Date(selectedDestination.returnDate);
        const data = [];

        let currentDate = new Date(startDate);
        const options = { month: 'short', day: 'numeric' };

        for (let i = 0; currentDate <= endDate; i++) {
            data.push({
                date: currentDate.toLocaleDateString('en-US', options),
                temp: weatherData[i] || null
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log("Formatted Weather Data for Graph:", data);
        
        const width = 300;
        const height = 100;
        const margin = { top: 10, right: 5, bottom: 20, left: 30 };

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scalePoint()
            .domain(data.map(d => d.date.toString()))
            .range([0, width])
            .padding(0.5);

        const y = d3.scaleLinear()
            .domain([
                d3.min(data, d => d.temp) - 1,
                d3.max(data, d => d.temp) + 1
            ])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.temp))
            .curve(d3.curveMonotoneX);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSize(3).tickPadding(5));

        svg.append("g")
            .call(d3.axisLeft(y).ticks(4).tickSize(3).tickPadding(5));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#4682B4")
            .attr("stroke-width", 2)
            .attr("d", line);
    }, [weatherData, selectedDestination]);



    return (
        <CustomCard>
            <Box sx={{ 
                height: '500px',
                display: 'flex',
                flexDirection: 'column',
                p: 3
            }}>
                {!selectedDestination ? (
                    <Typography variant="h6" fontWeight="bold">Weather Information</Typography>
                ) : (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                src={`https://countryflagsapi.netlify.app/flag/${selectedDestination.destination_info.iso_code.toLowerCase()}.svg`}
                                alt={selectedDestination.destination_info.country_name}
                                sx={{ width: 40, height: 24, borderRadius: '2px' }}
                            />
                            <Typography variant="h5" fontWeight="bold">
                                {selectedDestination.destination_info.city_name}, {selectedDestination.destination_info.country_name}
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
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
                            <Typography variant="h6" fontWeight="bold" mb={2}>Trip Details</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Departure</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedDestination.departureDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Return</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedDestination.returnDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                                    <Typography variant="body1">
                                        {selectedDestination.pcp?.duration || 'N/A'} days
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Price</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        £{selectedDestination.price?.total || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'left' }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Temperature Trend</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <svg ref={svgRef}></svg>
                        </Box>
                    </Box>
                )}
            </Box>
        </CustomCard>
    );
};

export default WeatherCard;
