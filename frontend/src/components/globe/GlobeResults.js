import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { drag } from "d3-drag";
import { Tooltip, Typography, Chip, Box, Avatar, Divider } from "@mui/material";
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const GlobeResults = ({ data = [] }) => {
  const globeRef = useRef();
  const [tooltipContent, setTooltipContent] = React.useState(null);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!globeRef.current) return;
  
    const container = d3.select(globeRef.current);
    container.selectAll("*").remove(); // Clear existing elements
  
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
  
    const projection = geoOrthographic()
      .scale(width / 3)
      .translate([width / 2, height / 2])
      .rotate([0, 0]);
  
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
          return isHighlighted ? "#4CAF50" : "#4d4c60";
        })
        .attr("stroke", "#222")
        .on("mouseenter", (event, d) => {
          const countryName = d.properties.name;
          const isHighlighted = filteredCountries.has(countryName);
          
          // Find all trips to this country
          const countryTrips = data.filter(trip => 
            trip.destination_info.country_name === countryName
          );
          
          // Create tooltip content with Material UI components
          setTooltipContent(
            <Box sx={{ p: 1, maxWidth: 350 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
                  {countryName}
                </Typography>
                
                {/* Advisory chip - only if it exists and is not "none" */}
                {isHighlighted && countryTrips[0]?.pcp?.safety && 
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
              
              {/* Visa information with country flag */}
              {isHighlighted && countryTrips.length > 0 && (
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
                          sx={{ 
                            color: 'white',
                            bgcolor: '#363636'
                          }}
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
                        sx={{ 
                          color: 'white',
                          bgcolor: '#1976d2'
                        }}
                      />
                    )}
                  </Box>
                </Box>
              )}
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
      projection.rotate([
        rotate[0] + event.dx * 0.3,
        rotate[1] - event.dy * 0.3,
      ]);
      svg.selectAll("path").attr("d", path);
    });
  
    svg.call(dragBehavior);
  
    // Add zoom behavior
    const zoomBehavior = d3.zoom().on("zoom", (event) => {
      const newScale = Math.max(100, Math.min(width / 2, event.transform.k * (width / 3)));
      projection.scale(newScale);
      svg.selectAll("path").attr("d", path);
    });
  
    svg.call(zoomBehavior);
  
  }, [data]);
  

  return (
    <>
      <div ref={globeRef} style={{ width: "100%", minHeight: "400px", height: "100%" }} />
      
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
    </>
  );
};

export default GlobeResults;