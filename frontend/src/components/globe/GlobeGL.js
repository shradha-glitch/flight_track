import React, { useRef, useEffect, useState, useMemo } from "react";
import Globe from "globe.gl";
import { Box, Tooltip, Typography, Chip, Avatar, Divider, Paper } from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { GlobeColorSelector } from "./GlobeColorSelector";
import {API_URL} from '../../constants';
import { Switch, FormControlLabel } from "@mui/material";

const ColorLegend = ({ colorScheme }) => {
  const legendItems =
    colorScheme === "visa"
      ? [
          { color: "#4CAF50", label: "Visa Free" },
          { color: "#8BC34A", label: "Visa with Day Limit" },
          { color: "#CDDC39", label: "ETA" },
          { color: "#FFC107", label: "E-Visa" },
          { color: "#FF9800", label: "Visa on Arrival" },
          { color: "#F44336", label: "Visa Required" },
          { color: "#2196F3", label: "Home Country" },
          { color: "#9E9E9E", label: "Unknown" }
        ]
      : [
          { color: "#5de362", label: "No Advisory" },
          { color: "#dff235", label: "Advisory for Certain Areas" },
          { color: "#f29913", label: "Advisory against Non-Essential Travel" },
          { color: "#e6091c", label: "Advisory against All Travel" },
          { color: "#9E9E9E", label: "Unknown" }
        ];
  
  return (
    <Paper 
      elevation={3}
      sx={{ 
        bgcolor: 'rgba(0, 0, 0, 0.7)', 
        color: 'white',
        p: 1.5,
        borderRadius: 1,
        maxWidth: 220
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        {colorScheme === "visa" ? "Visa Requirements" : "Travel Advisory"}
      </Typography>
      {legendItems.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: item.color,
              mr: 1
            }} 
          />
          <Typography variant="caption">
            {item.label}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

const fetchAdvisory = async (country_code) => {
  try {
    const response = await fetch(`${API_URL}/api/advisory/${country_code}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Fetching advisory for ${country_code} failed:`, error);
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

const getVisaRequirementFromTrips = (feature, tripsData) => {
  const countryName = feature.properties.name;
  const geoISO = feature.id; 
  
  const matchingTrips = tripsData.filter(trip => {
    const tripISO = trip.destination_info?.iso_code;
    if (tripISO && geoISO) {
      return tripISO.toLowerCase() === geoISO.toLowerCase();
    }
    const tripCountry = trip.destination_info?.country_name?.toLowerCase();
    const hoverCountry = countryName.toLowerCase();
    return (
      tripCountry &&
      (tripCountry === hoverCountry ||
        tripCountry.includes(hoverCountry) ||
        hoverCountry.includes(tripCountry))
    );
  });
  
  if (matchingTrips.length === 0) return "unknown";
  
  const visaDetails = matchingTrips[0].pcp?.visaDetails;
  if (!visaDetails) return "unknown";
  
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
  
  let worst = "unknown";
  for (let key in visaDetails) {
    let req = visaDetails[key];
    if (typeof req === "number") {
      if (req > 0) {
        req = "visa with day limit";
      } else if (req < 0) {
        req = "home country";
      }
    } else if (typeof req === "string") {
      const num = parseInt(req, 10);
      if (!isNaN(num)) {
        req = num > 0 ? "visa with day limit" : num < 0 ? "home country" : req;
      } else if (req.toLowerCase() === "home country") {
        req = "home country";
      }
    }
    if (req && visaPriority[req] > visaPriority[worst]) {
      worst = req;
    }
  }
  return worst;
};


const GlobeGL = ({ data = [], onSelectedDestination, selectedDestination }) => {
  const globeRef = useRef();
  const globeEl = useRef();
  const [countries, setCountries] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [colorScheme, setColorScheme] = useState("advisory");
  const [advisoryData, setAdvisoryData] = useState({});
  const [visaData, setVisaData] = useState({});
  const [countryNames, setCountryNames] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const tooltipTimeoutRef = useRef(null);
  const [routes, setRoutes] = useState([]);
  const [enableFreeDrag, setEnableFreeDrag] = useState(false);

  const LONDON_COORDS = {
    lat: 51.5074,
    lng: -0.1278
  };

  useEffect(() => {
    const newRoutes = data.map(destination => ({
      startLat: LONDON_COORDS.lat,
      startLng: LONDON_COORDS.lng,
      endLat: destination.destination_info?.latitude,
      endLng: destination.destination_info?.longitude,
      color:'rgb(255, 7, 201)', 
      destination_info: destination.destination_info,
    }));
    setRoutes(newRoutes);

  }, [data]);

  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
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
  
  const mapCountryCodesToNames = (worldData) => {
    const countryMap = {};
    worldData.features.forEach((feature) => {
      countryMap[feature.id] = feature.properties.name;
    });
    setCountryNames(countryMap);
  };

  const getCountryColor = (feat, isHighlighted) => {
    if (!isHighlighted) return "#4d4c60";
    switch (colorScheme) {
      case "advisory": {
        const advisory = advisoryData[feat.id];
        return advisory
          ? advisory.advice === "No advisory"
            ? "#5de362" 
            : advisory.advice === "Advisory against travel to certain areas"
            ? "#dff235" 
            : advisory.advice === "Advisory against non-essential travel"
            ? "#f29913" 
            : advisory.advice === "Advisory against all travel"
            ? "#e6091c" 
            : "#9E9E9E"
          : "#9E9E9E";
      }
      case "visa": {
        const visaRequirement = getVisaRequirementFromTrips(feat, data);
        return visaRequirement === "visa free" ? "#4CAF50" :
               visaRequirement === "visa with day limit" ? "#8BC34A" :
               visaRequirement === "eta" ? "#CDDC39" :
               visaRequirement === "e-visa" ? "#FFC107" :
               visaRequirement === "visa on arrival" ? "#FF9800" :
               visaRequirement === "visa required" ? "#F44336" :
               visaRequirement === "home country" ? "#2196F3" :
               "#9E9E9E";
      }
      default:
        return "#4CAF50";
    }
  };

  const isCountryHighlighted = (feat) => {
    const countryName = feat.properties.name;
    const countryId = feat.id;
    return (countryName && filteredCountries.has(countryName)) ||
           (countryName && filteredCountries.has(countryName.toLowerCase())) ||
           (countryId && filteredCountries.has(countryId));
  };

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

  useEffect(() => {
    if (!globeEl.current) return;
    globeEl.current
      .arcColor((arc, idx) => arc.__hover ? '#4CAF50' : 'rgb(255, 7, 201)')
      .arcDashLength(1.5)
      .arcDashGap(0.03)
      .arcDashAnimateTime(2000)
      .arcsData(routes)
      .arcsTransitionDuration(1000)
      .arcStroke(0.7)
      .arcAltitude(0.5)
      .onArcHover((arc) => {
        if (arc) {
          arc.__hover = true;
          globeEl.current.arcsData([...routes]);
        } else {
          routes.forEach(route => route.__hover = false);
          globeEl.current.arcsData([...routes]);
        }
      });
  }, [routes]);



  useEffect(() => {
    if (!globeRef.current || countries.length === 0) return;

    const filteredFeatures = countries.filter(d => d.properties.ISO_A2 !== 'AQ');
    
    if (!globeEl.current) {
      globeEl.current = Globe()(globeRef.current);
      globeEl.current
        .width(globeRef.current.clientWidth)
        .height(globeRef.current.clientHeight)
        .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
        .lineHoverPrecision(0)
        .polygonAltitude(0.01)
        .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
        .polygonStrokeColor(() => '#111')
        .polygonsTransitionDuration(300)
        .enablePointerInteraction(true)

      if (globeEl.current.controls()) {
        globeEl.current.controls().enableZoom = true;
        globeEl.current.controls().autoRotate = false;
        globeEl.current.controls().enablePan = false;
        globeEl.current.controls().enableRotate = true;
        globeEl.current.controls().minPolarAngle = enableFreeDrag ? 0 : Math.PI / 3.5;
        globeEl.current.controls().maxPolarAngle = enableFreeDrag ? Math.PI : Math.PI / 1.7;
      }
    }

    if (globeEl.current && globeEl.current.controls()) {
      globeEl.current.controls().minPolarAngle = enableFreeDrag ? 0 : Math.PI / 3.5;
      globeEl.current.controls().maxPolarAngle = enableFreeDrag ? Math.PI : Math.PI / 1.7;
    }
    
    globeEl.current
      .polygonsData(filteredFeatures)
      .polygonCapColor(feat => getCountryColor(feat, isCountryHighlighted(feat)))
      .polygonLabel(() => null);
    
    globeEl.current
      .onPolygonClick((polygon, event, {lat,lng}) => {
        const closestDestination = data.find(dest => {
          const destLat = dest.destination_info?.latitude;
          const destLng = dest.destination_info?.longitude;
          return Math.abs(destLat-lat) < 2 && Math.abs(destLng-lng) < 2;
        });

        if (closestDestination) {
          onSelectedDestination(closestDestination);
        }
      })
      .onArcClick((arc) => {
        const clickedDestination = data.find(dest => 
          dest.destination_info?.latitude === arc.endLat && 
          dest.destination_info?.longitude === arc.endLng
        );
        
        if (clickedDestination) {
          onSelectedDestination(clickedDestination);
        }
      });
    globeEl.current.onPolygonHover((hoverD) => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = null;
      }
      
      globeEl.current.polygonAltitude(d => d === hoverD ? 0.04 : 0.01);
      if (hoverD) {
        console.log("Hovering over country:", hoverD.properties.name);
        const countryName = hoverD.properties.name;
        const highlighted = isCountryHighlighted(hoverD);
        const countryTrips = data.filter(trip => {
          const tripISO = trip.destination_info?.iso_code;
          const geoISO = hoverD.id;
          if (tripISO && geoISO) {
            return tripISO.toLowerCase() === geoISO.toLowerCase();
          }
          const tripCountry = trip.destination_info?.country_name?.toLowerCase();
          const hoverCountry = countryName.toLowerCase();
          return (
            tripCountry &&
            (tripCountry === hoverCountry ||
             tripCountry.includes(hoverCountry) ||
             hoverCountry.includes(tripCountry))
          );
        });
        console.log("Country trips:", countryTrips.length, "Highlighted:", highlighted);
        
        setTooltipContent(
          <Box sx={{ p: 1, maxWidth: 350 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                src={`https://countryflagsapi.netlify.app/flag/${hoverD.id.toLowerCase()}.svg`}
                alt={countryName}
                sx={{ width: 40, height: 24, borderRadius: '2px', mr: 1 }}
              />
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
        tooltipTimeoutRef.current = setTimeout(() => {
          setTooltipOpen(false);
        }, 50);
      }
    });
    
    const handleResize = () => {
      if (globeEl.current && globeRef.current) {
        globeEl.current
          .width(globeRef.current.clientWidth)
          .height(globeRef.current.clientHeight);
      }
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [countries, filteredCountries, colorScheme, advisoryData, visaData, data, countryNames, mousePosition, onSelectedDestination, enableFreeDrag]);
  
  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
        <GlobeColorSelector onChange={handleColorSchemeChange} />
        <FormControlLabel
          sx={{
            ml: 1,
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#D8AD1D', 
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#D8AD1D', 
            },
            '& .MuiSwitch-switchBase': {
              color: 'white', 
            },
            '& .MuiSwitch-track': {
              backgroundColor: 'grey', 
            }
          }}
          control={
            <Switch
              checked={enableFreeDrag}
              onChange={(e) => setEnableFreeDrag(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography sx={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              Free Rotation
            </Typography>
          }
        />
      </Box>
      </Box>
      
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
        <ColorLegend colorScheme={colorScheme} />
      </Box>
      
      <div
        ref={globeRef}
        style={{ width: "100%", height: "100%" }}
        onMouseLeave={() => setTooltipOpen(false)}
      />
      <Tooltip
        open={tooltipOpen}
        title={tooltipContent || ""}
        arrow
        placement="top"
        TransitionProps={{ timeout: { enter: 50, exit: 50 } }}
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
          }
        }}
      />
    </Box>
  );
};

export default GlobeGL;