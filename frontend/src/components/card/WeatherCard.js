import React, { useEffect, useRef } from 'react';
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
        if (!selectedDestination) return;

        const data = [
            { date: "Mar 11", temp: 14 },
            { date: "Mar 12", temp: 16 },
            { date: "Mar 13", temp: 13 },
            { date: "Mar 14", temp: 17 },
            { date: "Mar 15", temp: 15 }
        ];
        
        const width = 400;
        const height = 100;
        const margin = { top: 10, right: 5, bottom: 20, left: 20 };

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scalePoint()
            .domain(data.map(d => d.date))
            .range([0, width])
            .padding(0.5);

        const y = d3.scaleLinear()
            .domain([10, 20])
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
    }, [selectedDestination]);

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
                                    <Typography variant="body1">11 March 2025</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Return</Typography>
                                    <Typography variant="body1">15 March 2025</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                                    <Typography variant="body1">4 days</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Price</Typography>
                                    <Typography variant="body1" fontWeight="bold">£164.87</Typography>
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
