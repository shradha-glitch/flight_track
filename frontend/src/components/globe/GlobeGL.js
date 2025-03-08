import React, { useRef, useEffect, useState } from "react";
import Globe from "globe.gl";
import { Box } from "@mui/material";
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

// Add fetch function for world data
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
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [colorScheme, setColorScheme] = useState("advisory");
  const [advisoryData, setAdvisoryData] = useState({});
  const [visaData, setVisaData] = useState({});
  const [countryNames, setCountryNames] = useState({});
  
  // Create a Set of filtered country names for easier lookup
    const filteredCountries = React.useMemo(() => {
    console.log("Filtered destinations:", data);
    // Create a more flexible matching by normalizing country names
    const countrySet = new Set();
    data.forEach(d => {
      if (d.destination_info?.country_name) {
        countrySet.add(d.destination_info.country_name);
        // Also add lowercase version for case-insensitive matching
        countrySet.add(d.destination_info.country_name.toLowerCase());
        // Add ISO code for more reliable matching
        if (d.destination_info?.iso_code) {
          countrySet.add(d.destination_info.iso_code);
        }
      }
    });
    console.log("Filtered countries set:", Array.from(countrySet));
    return countrySet;
  }, [data]);
  
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
      countryMap[feature.id] = feature.properties.NAME;
    });
    setCountryNames(countryMap);
  };

    // Add useEffect to fetch world data when component mounts
    useEffect(() => {
        const loadWorldData = async () => {
        const worldData = await fetchWorldData();
        if (worldData && worldData.features) {
            // Debug: Check for Israel in the world data
            const israelFeature = worldData.features.find(f => 
              f.properties.name === "Israel" || f.id === "ISR" || f.id === "IL"
            );
            console.log("Israel in world data:", israelFeature);
            
            setCountries(worldData.features);
            mapCountryCodesToNames(worldData);
        }
        };
        
        loadWorldData();
    }, []);
  // Fetch world data and advisory data
  // Remove the duplicate fetch in this useEffect
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log("Fetching advisory data...");
        
        if (countries.length > 0) {
            // Fetch advisory data
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
            console.log("Advisory data fetched", Object.keys(advisoryMap).length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchAllData();
  }, [countries]);

  // Initialize and update the globe
  useEffect(() => {
    console.log("Globe update effect running", {
      hasGlobeRef: !!globeRef.current,
      countriesLength: countries.length,
      filteredCountriesSize: filteredCountries.size,
      advisoryDataSize: Object.keys(advisoryData).length
    });
    
    if (!globeRef.current) {
      console.log("Globe ref not available yet");
      return;
    }
    
    if (countries.length === 0) {
      console.log("No countries data available yet");
      return;
    }

    // Filter out Antarctica
    const filteredFeatures = countries.filter(d => d.properties.ISO_A2 !== 'AQ');
    console.log("Filtered features:", filteredFeatures.length);
    
    // Initialize globe if it doesn't exist
    if (!globeEl.current) {
      console.log("Creating new globe instance");
      // Create the globe instance
      globeEl.current = Globe()(globeRef.current);
      
      // Configure the globe
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
    
    // Update polygon data and colors
    console.log("Updating polygon data and colors");
    globeEl.current
      .polygonsData(filteredFeatures)
      .polygonCapColor(feat => {
        const countryName = feat.properties.name;
        const countryId = feat.id;
        
        // Log country info for debugging
        if (countryName === "Israel" || countryId === "ISR" || countryId === "IL") {
          console.log("Found Israel in world data:", {
            id: countryId,
            name: countryName,
            feat
          });
        }
        
        // Check multiple ways to match the country
        const isHighlighted = 
          (countryName && filteredCountries.has(countryName)) || 
          (countryName && filteredCountries.has(countryName.toLowerCase())) ||
          (countryId && filteredCountries.has(countryId));
        
        // If not highlighted, use a muted color
        if (!isHighlighted) return "#4d4c60";
        
        console.log(`Highlighting country: ${countryName} (${countryId})`);
        
        // Apply advisory coloring from GlobeAdvisory.js
        const advisory = advisoryData[feat.id];
        return advisory
          ? advisory.advice === "No advisory"
            ? "#4CAF50" // Safe - green
            : advisory.advice === "Advisory against travel to certain areas"
              ? "#674f82" // Some caution - purple
              : advisory.advice === "Advisory against non-essential travel"
                ? "#c07182" // High caution - pink
                : advisory.advice === "Advisory against all travel"
                  ? "#e69c67" // Danger - orange
                  : "#9E9E9E" // Unknown - grey
          : "#9E9E9E"; // Unknown - grey
      });
    
    // Set up hover and click interactions
    globeEl.current
      .onPolygonHover(hoverD => {
        // Highlight hovered country
        globeEl.current
          .polygonAltitude(d => d === hoverD ? 0.04 : 0.01);
        
        if (hoverD) {
          const countryName = hoverD.properties.NAME;
          // Check both exact match and case-insensitive match - safely handle undefined
          const isHighlighted = countryName && (
            filteredCountries.has(countryName) || 
            filteredCountries.has(countryName.toLowerCase())
          );
          
          // Find all trips to this country - use case-insensitive comparison
          const countryTrips = data.filter(trip => 
            trip.destination_info?.country_name && countryName && (
              trip.destination_info.country_name === countryName ||
              trip.destination_info.country_name.toLowerCase() === countryName.toLowerCase()
            )
          );
          
          // Create HTML content for tooltip
          let tooltipHTML = `<div style="padding: 10px; max-width: 300px; background: white; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
            <h3 style="margin-top: 0; margin-bottom: 10px;">${countryName}</h3>`;
          
          if (isHighlighted) {
            if (colorScheme === "advisory" && advisoryData[hoverD.id]) {
              tooltipHTML += `<div style="margin-bottom: 10px;">
                <span style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; background-color: ${
                  advisoryData[hoverD.id].advice === "No advisory" ? "#4CAF50" :
                  advisoryData[hoverD.id].advice === "Advisory against travel to certain areas" ? "#FFC107" :
                  "#F44336"
                }; color: white;">${advisoryData[hoverD.id].advice}</span>
              </div>`;
            }
            
            if (colorScheme === "visa") {
              tooltipHTML += `<div style="margin-bottom: 10px;">`;
              for (let passportCode in visaData) {
                if (visaData[passportCode] && visaData[passportCode][hoverD.id]) {
                  let visaRequirement = visaData[passportCode][hoverD.id];
                  if (typeof visaRequirement === "number" && visaRequirement > 0) {
                    visaRequirement = `${visaRequirement} days of Visa Free travel`;
                  }
                  if (typeof visaRequirement === "number" && visaRequirement < 0) {
                    visaRequirement = "home country";
                  }
                  
                  tooltipHTML += `<div style="margin-bottom: 5px;">
                    <img src="https://countryflagsapi.netlify.app/flag/${passportCode.toLowerCase()}.svg" 
                         style="width: 20px; height: 15px; margin-right: 5px; vertical-align: middle;" />
                    <span>${countryNames[passportCode] || passportCode}: ${visaRequirement}</span>
                  </div>`;
                }
              }
              tooltipHTML += `</div>`;
            }
            
            // Add trip information
            countryTrips.forEach((trip, index) => {
              if (index > 0) {
                tooltipHTML += `<hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;" />`;
              }
              
              tooltipHTML += `<div>
                <div style="font-weight: 500; margin-bottom: 5px;">${trip.destination_info.city_name} (${trip.destination})</div>
                <div style="font-size: 14px; margin-bottom: 5px;">
                  ${new Date(trip.departureDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                  })} - ${new Date(trip.returnDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
                <div style="font-weight: bold; font-size: 14px;">£${trip.price?.total || 'N/A'}</div>
              </div>`;
            });
          } else {
            tooltipHTML += `<div>No trips available to this country</div>`;
          }
          
          tooltipHTML += `</div>`;
          
          // Get mouse position from the window event
          const event = window.event;
          if (event) {
            setTooltipPosition({ 
              x: event.clientX, 
              y: event.clientY 
            });
            setTooltipContent(tooltipHTML);
            setTooltipVisible(true);
          }
        } else {
          setTooltipVisible(false);
        }
      });
    
    // Handle window resize
    const handleResize = () => {
      if (globeEl.current && globeRef.current) {
        globeEl.current
          .width(globeRef.current.clientWidth)
          .height(globeRef.current.clientHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [countries, filteredCountries, colorScheme, advisoryData, visaData, data, countryNames]);

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
      
      {/* Custom tooltip */}
      {tooltipVisible && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
            zIndex: 1000,
            pointerEvents: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
    </Box>
  );
};

export default GlobeGL;