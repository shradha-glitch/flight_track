import React, { useRef, useEffect, useState, useMemo } from "react";
import Globe from "globe.gl";
import { Box, Tooltip, Typography, Chip, Avatar, Divider } from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { GlobeColorSelector } from "./GlobeColorSelector";
import * as d3 from "d3";

// Fetch functions for advisory and visa data
const fetchAdvisory = async (country_code) => {
  try {
    const response = await fetch(`http://127.0.0.1:8001/api/advisory/${country_code}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Fetching advisory for ${country_code} failed:`, error);
    return null;
  }
};

const fetchVisa = async (countryCode) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8001/api/visa?country_codes=${countryCode}`
    );
    if (!response.ok) throw new Error("Network response did not work");
    const result = await response.json();
    return result;
  } catch (error) {
    return null;
  }
};

const fetchWorldData = async () => {
  try {
    const response = await fetch("/world.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch world.json: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching world data:", error);
    return null;
  }
};

const GlobeGL = ({ data = [] }) => {
  const globeRef = useRef();
  const globeEl = useRef();
  const [countries, setCountries] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [colorScheme, setColorScheme] = useState("advisory");
  const [advisoryData, setAdvisoryData] = useState({});
  const [visaData, setVisaData] = useState({});
  const [countryNames, setCountryNames] = useState({});
  // Track mouse coordinates for a virtual anchor element
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Track mouse position globally
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Create a Set of filtered country names for easier lookup
  const filteredCountries = useMemo(() => {
    const countrySet = new Set();
    data.forEach(d => {
      if (d.destination_info?.country_name) {
        countrySet.add(d.destination_info.country_name);
        countrySet.add(d.destination_info.country_name.toLowerCase());
        if (d.destination_info?.iso_code) {
          countrySet.add(d.destination_info.iso_code);
        }
      }
    });
    return countrySet;
  }, [data]);
  
  // Get passport countries from data
  const passportCountries = useMemo(() => {
    const countries = new Set();
    data.forEach(trip => {
      if (trip.pcp?.visaDetails) {
        Object.keys(trip.pcp.visaDetails).forEach(code => countries.add(code));
      }
    });
    return Array.from(countries);
  }, [data]);
  
  // Get worst visa requirement for a country
  const getWorstVisaRequirement = (countryId) => {
    let worstRequirement = "unknown";
    const visaPriority = {
      "unknown": 0,
      "home country": 1,
      "visa free": 2,
      "visa with day limit": 3,
      "eta": 4,
      "e-visa": 5,
      "visa on arrival": 6,
      "visa required": 7
    };

    for (let passportCode in visaData) {
      const requirements = visaData[passportCode];
      if (requirements && requirements[countryId]) {
        const requirement = requirements[countryId];
        const processedRequirement = typeof requirement === "number" && requirement > 0
          ? "visa with day limit"
          : requirement;
        if (processedRequirement && visaPriority[processedRequirement] > visaPriority[worstRequirement]) {
          worstRequirement = processedRequirement;
        }
      }
    }
  
    return worstRequirement;
  };

  // Map country codes to names
  const mapCountryCodesToNames = (worldData) => {
    const countryMap = {};
    worldData.features.forEach((feature) => {
      countryMap[feature.id] = feature.properties.name;
    });
    setCountryNames(countryMap);
  };

  // Determine country color based on color scheme
  const getCountryColor = (feat, isHighlighted) => {
    if (!isHighlighted) return "#4d4c60";
    switch (colorScheme) {
      case "advisory":
        const advisory = advisoryData[feat.id];
        return advisory
          ? advisory.advice === "No advisory"
            ? "#4CAF50"
            : advisory.advice === "Advisory against travel to certain areas"
              ? "#674f82"
              : advisory.advice === "Advisory against non-essential travel"
                ? "#c07182"
                : advisory.advice === "Advisory against all travel"
                  ? "#e69c67"
                  : "#9E9E9E"
          : "#9E9E9E";
      
      case "visa":
        const visaRequirement = getWorstVisaRequirement(feat.id);
        return visaRequirement === "visa free" ? "#4CAF50" :
               visaRequirement === "visa with day limit" ? "#8BC34A" :
               visaRequirement === "eta" ? "#CDDC39" :
               visaRequirement === "e-visa" ? "#FFC107" :
               visaRequirement === "visa on arrival" ? "#FF9800" :
               visaRequirement === "visa required" ? "#F44336" :
               visaRequirement === "home country" ? "#2196F3" :
               "#9E9E9E";
      
      default:
        return "#4CAF50";
    }
  };

  // Check if a country should be highlighted
  const isCountryHighlighted = (feat) => {
    const countryName = feat.properties.name;
    const countryId = feat.id;
    return (countryName && filteredCountries.has(countryName)) || 
           (countryName && filteredCountries.has(countryName.toLowerCase())) ||
           (countryId && filteredCountries.has(countryId));
  };

  // Fetch world data when component mounts
  useEffect(() => {
    const loadWorldData = async () => {
      const worldData = await fetchWorldData();
      if (worldData && worldData.features) {
        setCountries(worldData.features);
        mapCountryCodesToNames(worldData);
      }
    };
    loadWorldData();
  }, []);

  // Fetch advisory data when countries are loaded
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (countries.length > 0) {
          const countryCodes = countries.map((d) => d.id);
          const advisoryPromises = countryCodes.map(async (code) => {
            const data = await fetchAdvisory(code);
            return { code, data };
          });
          const advisoryResults = await Promise.all(advisoryPromises);
          const advisoryMap = {};
          advisoryResults.forEach(({ code, data }) => {
            if (data) {
              advisoryMap[code] = data;
            }
          });
          setAdvisoryData(advisoryMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchAllData();
  }, [countries]);

  // Initialize and update the globe
  useEffect(() => {
    if (!globeRef.current || countries.length === 0) return;

    // Filter out Antarctica
    const filteredFeatures = countries.filter(d => d.properties.ISO_A2 !== 'AQ');
    
    // Initialize globe if it doesn't exist
    if (!globeEl.current) {
      globeEl.current = Globe()(globeRef.current);
      globeEl.current
        .width(globeRef.current.clientWidth)
        .height(globeRef.current.clientHeight)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .lineHoverPrecision(0)
        .polygonAltitude(0.01)
        .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
        .polygonStrokeColor(() => '#111')
        .polygonsTransitionDuration(300);
    }
    
    // Update the globe with the countries data
    globeEl.current
      .polygonsData(filteredFeatures)
      .polygonCapColor(feat => getCountryColor(feat, isCountryHighlighted(feat)))
      .polygonLabel(() => null);
    
    // Modify onPolygonHover callback to update tooltip content based on trips
    globeEl.current.onPolygonHover((hoverD) => {
      globeEl.current.polygonAltitude(d => d === hoverD ? 0.04 : 0.01);
      if (hoverD) {
        console.log("Hovering over country:", hoverD.properties.name);
        const countryName = hoverD.properties.name;
        const highlighted = isCountryHighlighted(hoverD);
        const countryTrips = data.filter(trip => 
          trip.destination_info?.country_name && countryName && (
            trip.destination_info.country_name === countryName ||
            trip.destination_info.country_name.toLowerCase() === countryName.toLowerCase()
          )
        );
        console.log("Country trips:", countryTrips.length, "Highlighted:", highlighted);
        
        setTooltipContent(
          <Box sx={{ p: 1, maxWidth: 350 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
                {countryName}
              </Typography>
              {highlighted && countryTrips[0]?.pcp?.safety && 
                countryTrips[0].pcp.safety !== "None" && 
                countryTrips[0].pcp.safety !== "No advisory" && (
                  <Chip 
                    icon={<ReportProblemIcon />}
                    label={countryTrips[0].pcp.safety} 
                    color="warning" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
              )}
            </Box>
            {highlighted && countryTrips.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  {countryTrips[0]?.pcp?.visaDetails ? (
                    Object.entries(countryTrips[0].pcp.visaDetails).map(([key, value]) => (
                      <Chip
                        key={key}
                        avatar={
                          <Avatar 
                            src={`https://countryflagsapi.netlify.app/flag/${key.toLowerCase()}.svg`}
                            alt={key}
                          />
                        }
                        label={`${value}`}
                        variant="filled"
                        size="small"
                        sx={{ color: 'white', bgcolor: '#363636' }}
                      />
                    ))
                  ) : (
                    <Chip
                      avatar={
                        <Avatar 
                          src={`https://countryflagsapi.netlify.app/flag/${countryTrips[0].destination_info.iso_code.toLowerCase()}.svg`}
                          alt={countryTrips[0].destination_info.country_name}
                        />
                      }
                      label="Visa: N/A"
                      variant="filled"
                      size="small"
                      sx={{ color: 'white', bgcolor: '#1976d2' }}
                    />
                  )}
                </Box>
              </Box>
            )}
            {highlighted && countryTrips.map((trip, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                {index > 0 && <Divider sx={{ my: 1, borderColor: '#9e9e9e' }} />}
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  {trip.destination_info.city_name} ({trip.destination})
                </Typography>
                <Typography variant="body2">
                  {new Date(trip.departureDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                  })} - {new Date(trip.returnDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  £{trip.price?.total || 'N/A'}
                </Typography>
              </Box>
            ))}
            {!highlighted && (
              <Typography variant="body1">
                No trips available to this country
              </Typography>
            )}
          </Box>
        );
        setTooltipOpen(true);
      } else {
        setTooltipOpen(false);
      }
    });
    
    const handleResize = () => {
      if (globeEl.current && globeRef.current) {
        globeEl.current
          .width(globeRef.current.clientWidth)
          .height(globeRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [countries, filteredCountries, colorScheme, advisoryData, visaData, data, countryNames, mousePosition]);
  
  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Color selector in top left */}
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <GlobeColorSelector onChange={handleColorSchemeChange} />
      </Box>
      <div ref={globeRef} style={{ width: "100%", minHeight: "400px", height: "100%" }} />
      {/* Material UI Tooltip using a virtual anchor via slotProps */}
      <Tooltip
        open={tooltipOpen}
        title={tooltipContent || ""}
        arrow
        placement="top"
        slotProps={{
          popper: {
            anchorEl: {
              getBoundingClientRect: () => ({
                top: mousePosition.y,
                left: mousePosition.x,
                bottom: mousePosition.y,
                right: mousePosition.x,
                width: 0,
                height: 0,
              }),
            },
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 20],
                },
              },
            ],
            sx: {
              '& .MuiTooltip-tooltip': {
                fontSize: '1rem',
                maxWidth: 'none'
              }
            }
          }
        }}
      />
    </Box>
  );
};

export default GlobeGL;