import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { drag } from "d3-drag";
import { Tooltip, Typography, Chip, Box, Avatar, Divider } from "@mui/material";
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { GlobeColorSelector } from "./GlobeColorSelector";

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

const GlobeResults = ({ data = [] }) => {
  const globeRef = useRef();
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef(null);
  const [colorScheme, setColorScheme] = useState("advisory"); // Default to advisory
  const [advisoryData, setAdvisoryData] = useState({});
  const [visaData, setVisaData] = useState({});
  const [countryNames, setCountryNames] = useState({});
  const [globeRotation, setGlobeRotation] = useState([0, 0]); // Store rotation state
  const [globeScale, setGlobeScale] = useState(null); // Store scale state
  
  // Visa priority mapping for determining worst visa requirement
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
  
  // Get passport countries from data
  const passportCountries = React.useMemo(() => {
    const countries = new Set();
    data.forEach(trip => {
      if (trip.pcp?.visaDetails) {
        Object.keys(trip.pcp.visaDetails).forEach(code => countries.add(code));
      }
    });
    return Array.from(countries);
  }, [data]);
  
  // Map country codes to names
  const mapCountryCodesToNames = (worldData) => {
    const countryMap = {};
    worldData.features.forEach((feature) => {
      countryMap[feature.id] = feature.properties.name;
    });
    setCountryNames(countryMap);
  };
  
  // Get worst visa requirement for a country - using the same logic as GlobeVisa.js
  const getWorstVisaRequirement = (countryId) => {
    let worstRequirement = "unknown";

    for (let passportCode in visaData) {
      const requirements = visaData[passportCode];
      if (requirements && requirements[countryId]) {
        const requirement = requirements[countryId];

        const processedRequirement = typeof requirement === "number" && requirement > 0
          ? "visa with day limit"
          : requirement;

        if (processedRequirement && visaPriority[requirement] > visaPriority[worstRequirement]) {
          worstRequirement = processedRequirement;
        }
      }
    }
  
    return worstRequirement;
  };

  // Fetch advisory and visa data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const worldData = await d3.json("world.json");
        mapCountryCodesToNames(worldData);
        
        // Fetch advisory data
        const countryCodes = worldData.features.map((d) => d.id);
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
        
        // Fetch visa data for passport countries - using the same approach as GlobeVisa.js
        if (passportCountries.length > 0) {
          const allVisaData = {};

          for (let countryCode of passportCountries) {
            const data = await fetchVisa(countryCode);
            if (data) {
              allVisaData[countryCode] = data.requirements[countryCode];
            }
          }
          setVisaData(allVisaData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchAllData();
  }, [passportCountries]);

  useEffect(() => {
    if (!globeRef.current) return;
  
    const container = d3.select(globeRef.current);
    container.selectAll("*").remove(); // Clear existing elements
  
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
  
    // Use stored rotation and scale if available
    const initialScale = globeScale || width / 3;
    const initialRotation = globeRotation || [0, 0];
    
    const projection = geoOrthographic()
      .scale(initialScale)
      .translate([width / 2, height / 2])
      .rotate(initialRotation);
  
    const path = geoPath().projection(projection);
    const graticule = geoGraticule();
  
    const svg = container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");
  
    // Draw the base globe
    svg.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "#abcadb")
      .attr("stroke", "none");
  
    // Add graticule
    svg.append("path")
      .datum(graticule)
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#abcadb");
  
    // Create a Set of filtered country names for easier lookup
    const filteredCountries = new Set(
      data.map(d => d.destination_info.country_name)
    );
  
    // Load and draw countries based on filtered countries
    d3.json("world.json").then((worldData) => {
      svg.selectAll(".country")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", (d) => {
          const isHighlighted = filteredCountries.has(d.properties.name);
          
          // If not highlighted, always use the same color
          if (!isHighlighted) return "#4d4c60";
          
          // Apply different color schemes based on the selected option
          switch (colorScheme) {
            case "advisory":
              const advisory = advisoryData[d.id];
              return advisory
                ? advisory.advice === "No advisory"
                  ? "#4CAF50" // Safe
                  : advisory.advice === "Advisory against travel to certain areas"
                    ? "#FFC107" // Some caution
                    : advisory.advice === "Advisory against non-essential travel"
                      ? "#FF9800" // High caution
                      : advisory.advice === "Advisory against all travel"
                        ? "#F44336" // Danger
                        : "#9E9E9E" // Unknown
                : "#9E9E9E"; // Unknown
                
            case "visa":
              // Use the same color mapping as in GlobeVisa.js
              const worstVisa = getWorstVisaRequirement(d.id);
              switch (worstVisa) {
                case "visa free": return "#4CAF50";
                case "visa with day limit": return "#85e03f";
                case "visa required": return "#C70039";
                case "e-visa": return "#FF5733";
                case "visa on arrival": return "#fef018";
                case "eta": return "#DAF7A6";
                default: return "#4d4c60";
              }
              
            case "temperature":
              // Placeholder for temperature coloring
              return "#4CAF50";
              
            default:
              return "#4CAF50";
          }
        })
        .attr("stroke", "#222")
        .on("mouseenter", (event, d) => {
          const countryName = d.properties.name;
          const isHighlighted = filteredCountries.has(countryName);
          
          // Find all trips to this country
          const countryTrips = data.filter(trip => 
            trip.destination_info.country_name === countryName
          );
          
          // Create tooltip content based on the color scheme
          if (colorScheme === "visa") {
            // Use the same tooltip content as GlobeVisa.js
            const visaEntries = Object.entries(visaData).map(([passport, requirements]) => {
              let visaRequirement = requirements[d.id] || "No Data";
              if (typeof visaRequirement === "number" && visaRequirement > 0) {
                visaRequirement = `${visaRequirement} days of Visa Free travel`;
              }
              if (typeof visaRequirement === "number" && visaRequirement < 0) {
                visaRequirement = "home country";
              }
              return { passport, requirement: visaRequirement };
            });
            
            setTooltipContent(
              <Box sx={{ p: 1, maxWidth: 350 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {d.properties.name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {visaEntries.map(({ passport, requirement }) => (
                    <Chip
                      key={passport}
                      avatar={
                        <Avatar 
                          src={`https://countryflagsapi.netlify.app/flag/${passport.toLowerCase()}.svg`}
                          alt={countryNames[passport] || passport}
                        />
                      }
                      label={`${countryNames[passport] || passport}: ${requirement}`}
                      variant="filled"
                      size="small"
                      sx={{ 
                        color: 'white',
                        bgcolor: '#363636',
                        '& .MuiChip-label': {
                          whiteSpace: 'normal',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            );
          } else {
            // Default tooltip content for advisory and temperature
            setTooltipContent(
              <Box sx={{ p: 1, maxWidth: 350 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
                    {countryName}
                  </Typography>
                  
                  {/* Advisory chip - only if it exists */}
                  {isHighlighted && colorScheme === "advisory" && advisoryData[d.id] && (
                    <Chip 
                      icon={<ReportProblemIcon />}
                      label={advisoryData[d.id].advice} 
                      color={
                        advisoryData[d.id].advice === "No advisory" ? "success" :
                        advisoryData[d.id].advice === "Advisory against travel to certain areas" ? "warning" :
                        "error"
                      }
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                
                {/* Trip sections - one for each city */}
                {isHighlighted && countryTrips.map((trip, index) => (
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
                
                {!isHighlighted && (
                  <Typography variant="body1">
                    No trips available to this country
                  </Typography>
                )}
              </Box>
            );
          }
          
          setTooltipOpen(true);
          
          // Position the tooltip reference element
          if (tooltipRef.current) {
            tooltipRef.current.style.left = `${event.pageX}px`;
            tooltipRef.current.style.top = `${event.pageY}px`;
          }
        })
        .on("mouseleave", () => {
          setTooltipOpen(false);
        });
    });
  
    // Add drag behavior
    const dragBehavior = drag().on("drag", (event) => {
      const rotate = projection.rotate();
      const newRotation = [
        rotate[0] + event.dx * 0.3,
        rotate[1] - event.dy * 0.3,
      ];
      
      // Store the rotation state for persistence between renders
      setGlobeRotation(newRotation);
      
      projection.rotate(newRotation);
      svg.selectAll("path").attr("d", path);
    });
  
    svg.call(dragBehavior);
  
    // Add zoom behavior
    const zoomBehavior = d3.zoom().on("zoom", (event) => {
      const newScale = Math.max(100, Math.min(width / 2, event.transform.k * (width / 3)));
      
      // Store the scale state for persistence between renders
      setGlobeScale(newScale);
      
      projection.scale(newScale);
      svg.selectAll("path").attr("d", path);
    });
  
    svg.call(zoomBehavior);
  
  }, [data, colorScheme, advisoryData, visaData, globeRotation, globeScale]);
  
  // Handle color scheme change
  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Add the color selector to the top left */}
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <GlobeColorSelector onChange={handleColorSchemeChange} />
      </Box>
      
      <div ref={globeRef} style={{ width: "100%", height: "100%" }} />
      
      {/* Invisible element that follows the cursor for tooltip positioning */}
      <div 
        ref={tooltipRef}
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          pointerEvents: "none"
        }}
      />
      
      {/* Material UI Tooltip */}
      <Tooltip
        open={tooltipOpen}
        title={tooltipContent}
        arrow
        placement="top"
        PopperProps={{
          anchorEl: tooltipRef.current,
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 10],
              },
            },
          ],
          sx: {
            '& .MuiTooltip-tooltip': {
              fontSize: '1rem',
              maxWidth: 'none'
            }
          }
        }}
      />
    </Box>
  );
};

export default GlobeResults;