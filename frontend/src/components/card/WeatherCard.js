import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import CustomCard from "./Card";
import { Box, Typography, Divider, Avatar, Tooltip } from "@mui/material";
import { API_URL } from '../../constants';

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
            const apiUrl = `${API_URL}/api/neooneweather?departure_date=${departureDate}`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error("Failed to fetch weather data");
                const data = await response.json();
                console.log("Fetched Weather Data:", data);

                // Extract the specific destination's weather data from the response
                const destinationWeather = data.destinations[destination];

                if (destinationWeather && destinationWeather.daily_temperature && destinationWeather.daily_cloud_cover) {
                    setWeatherData({
                        temperatures: destinationWeather.daily_temperature || [],
                        cloudCover: destinationWeather.daily_cloud_cover || [],
                        radiation: destinationWeather.daily_radiation_sum || [],
                        rain: destinationWeather.daily_rain_sum || [],
                        snowfall: destinationWeather.daily_snowfall_sum || []
                    });
                } else {
                    console.warn("No complete weather data found in API response");
                    setWeatherData(null);
                }
            } catch (error) {
                console.error("Error fetching weather data:", error);
                setWeatherData(null);
            }
        };

        fetchWeatherData();
    }, [selectedDestination]);

    useEffect(() => {
        if (!weatherData || !selectedDestination) return;

        const startDate = new Date(selectedDestination.departureDate);
        const endDate = new Date(selectedDestination.returnDate);
        const data = [];

        let currentDate = new Date(startDate);
        const options = { month: 'short', day: 'numeric' };

        for (let i = 0; currentDate <= endDate; i++) {
            data.push({
                date: currentDate.toLocaleDateString('en-US', options),
                temp: weatherData.temperatures[i] ?? 0,
                cloudCover: weatherData.cloudCover[i] ?? 0,
                radiation: weatherData.radiation[i] ?? 0,
                rain: weatherData.rain[i] ?? 0,
                snowfall: weatherData.snowfall[i] ?? 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log("Formatted Weather Data for Graph:", data);

        const width = 275;
        const height = 100;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

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

        const yMin = Math.min(0, d3.min(data.flatMap(d => [d.temp, d.cloudCover, d.radiation, d.rain, d.snowfall])));
        const yMax = d3.max(data.flatMap(d => [d.temp, d.cloudCover, d.radiation, d.rain, d.snowfall])) * 1.1;

        const y = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([height, 0]);

        const lineGenerator = (key, color) => d3.line()
            .x(d => x(d.date))
            .y(d => y(d[key]))
            .curve(d3.curveMonotoneX);

        const datasets = [
            { key: "temp", color: "#F1C120" }, // Temperature
            { key: "cloudCover", color: "#A9A9A9" }, // Cloud Cover
            { key: "radiation", color: "#FF5733" }, // Solar Radiation
            { key: "rain", color: "#4682B4" }, // Rain
            { key: "snowfall", color: "#E0FFFF" } // Snowfall
        ];

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickValues(data.map((d, i) => (i % 2 === 0 ? d.date : null)).filter(Boolean)));

        svg.append("g")
            .call(d3.axisLeft(y).ticks(5));

        datasets.forEach(({ key, color }) => {
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 2)
                .attr("d", lineGenerator(key));
        });
        const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "#757575") 
        .style("border", "1px solid rgba(0, 0, 0, 0.12)") 
        .style("padding", "8px 12px") 
        .style("border-radius", "8px") 
        .style("box-shadow", "0px 2px 6px rgba(0, 0, 0, 0.15)") 
        .style("font-size", "13px") 
        .style("font-family", "'Roboto', sans-serif") 
        .style("color", "#fff") 
        .style("pointer-events", "none")
        .style("opacity", 0);

const labelMapping = {
    temp: "Temperature",
    cloudCover: "Cloud Cover",
    radiation: "Solar Radiation",
    rain: "Precipitation",
    snowfall: "Snowfall"
};

const unitMapping = {
    temp: "°C",
    cloudCover: "%",
    radiation: "W/m²",
    rain: "mm",
    snowfall: "cm"
};

datasets.forEach(({ key, color }) => {
    svg.selectAll(`.dot-${key}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", `dot-${key}`)
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d[key]))
        .attr("r", 3)
        .attr("fill", color)
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`
                    <strong>${d.date}</strong><br>
                    ${labelMapping[key]}: ${d[key].toFixed(2)} ${unitMapping[key]}
                `)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
});

    }, [weatherData, selectedDestination]);

    const getWeatherIcon = (weather, size = 40) => {
        switch (weather) {
            case 'Sunny':
                return <WbSunnyIcon sx={{ fontSize: size, color: '#FFD700' }} />;
            case 'Partly Clouded':
                return <FilterDramaIcon sx={{ fontSize: size, color: '#87CEEB' }} />;
            case 'Cloudy':
                return <CloudIcon sx={{ fontSize: size, color: '#A9A9A9' }} />;
            case 'Rainy':
                return <ThunderstormIcon sx={{ fontSize: size, color: '#4682B4' }} />;
            case 'Snowy':
                return <AcUnitIcon sx={{ fontSize: size, color: '#E0FFFF' }} />;
            default:
                return <WbSunnyIcon sx={{ fontSize: size, color: '#FFD700' }} />;
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
                {!selectedDestination ? (
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                        Weather Information
                    </Typography>
                ) : null}
                {!selectedDestination? (
                    <Typography color="text.secondary">
                        Select a destination in the "Filtered Destinations" list to view weather information.
                    </Typography>
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
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Weather Details</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
    {/* Graph Container */}
    <Box sx={{ width: '65%', pr: 3 }}>
        <svg ref={svgRef}></svg>
    </Box>

    {/* Legend Container */}
    <Box sx={{ width: '35%', display: 'flex', flexDirection: 'column', gap: 2, ml: 4 }}>
        {[
            { label: "Temperature", color: "#F1C120" },
            { label: "Cloud Cover", color: "#A9A9A9" },
            { label: "Solar Radiation", color: "#FF5733" },
            { label: "Rain", color: "#4682B4" },
            { label: "Snowfall", color: "#E0FFFF" }
        ].map(({ label, color }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, backgroundColor: color, borderRadius: '3px', flexShrink: 0 }}></Box>
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{label}</Typography>
            </Box>
        ))}
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