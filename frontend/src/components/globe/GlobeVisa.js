import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { drag } from "d3-drag";
import { Tooltip, Typography, Chip, Box, Avatar } from "@mui/material";

const FetchVisa = async (countryCode) => {
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

const GlobeVisa = ({ countryCodes = [] }) => {
  console.log("countries:", countryCodes); // Logging for debugging

  const globeRef = useRef();
  const [visaData, setVisaData] = useState({});
  const [countryNames, setCountryNames] = useState({});
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef(null);

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

  const mapCountryCodesToNames = (worldData) => {
    const countryMap = {};
    worldData.features.forEach((feature) => {
      countryMap[feature.id] = feature.properties.name;
    });
    setCountryNames(countryMap);
  };

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
          console.log("worstRequirement:", worstRequirement); // Logging for debugging
        }
      }
    }
  
    return worstRequirement;
  };  

  useEffect(() => {
    const fetchVisaForMultiplePassports = async () => {
      if (Array.isArray(countryCodes) && countryCodes.length > 0) {
        const allVisaData = {};

        for (let countryCode of countryCodes) {
          const data = await FetchVisa(countryCode);
          if (data) {
            allVisaData[countryCode] = data.requirements[countryCode];
          }
        }
        setVisaData(allVisaData);
      }
    };

    if (countryCodes && countryCodes.length > 0) {
      fetchVisaForMultiplePassports();
    }

    d3.json("world.json").then((worldData) => {
      mapCountryCodesToNames(worldData);
    });
  }, [countryCodes]); 

  useEffect(() => {
    if (globeRef.current && visaData) {
      const container = d3.select(globeRef.current);
      container.selectAll("*").remove();

      const width = container.node().clientWidth;
      const height = container.node().clientHeight;

      const projection = geoOrthographic()
        .scale(width / 3)
        .translate([width / 2, height / 2])
        .rotate([0, 0]);

      const path = geoPath().projection(projection);
      const graticule = geoGraticule();

      const svg = container.append("svg").attr("width", "100%").attr("height", "100%");

      svg
        .append("path")
        .datum({ type: "Sphere" })
        .attr("d", path)
        .attr("fill", "#abcadb")
        .attr("stroke", "none");

      svg
        .append("path")
        .datum(graticule)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#abcadb");

      d3.json("world.json").then((worldData) => {
        const countries = worldData.features;

        svg
          .selectAll(".country")
          .data(countries)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", path)
          .attr("fill", (d) => {
            const worstVisa = getWorstVisaRequirement(d.id);
            // console.log("worstVisa:", worstVisa); // Logging for debugging

            switch (worstVisa) {
              case "visa free":
                return "#4CAF50";
              case "visa with day limit":
                console.log("visa with day limit"); // Logging for debugging
                return "#85e03f";
              case "visa required":
                return "#C70039";
              case "e-visa":
                return "#FF5733";
              case "visa on arrival":
                return "#fef018";
              case "eta":
                return "#DAF7A6";
              default:
                return "#4d4c60";
            }
          })
          .attr("stroke", "#222")
          .on("mouseenter", (event, d) => {
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
          setTooltipOpen(true);
          
          if (tooltipRef.current) {
            tooltipRef.current.style.left = `${event.pageX}px`;
            tooltipRef.current.style.top = `${event.pageY}px`;
          }
          })
          .on("mouseleave", () => {
            setTooltipOpen(false);
          });
      });

      const dragBehavior = drag().on("drag", (event) => {
        const rotate = projection.rotate();
        projection.rotate([
          rotate[0] + event.dx * 0.3,
          rotate[1] - event.dy * 0.3,
        ]);
        svg.selectAll("path").attr("d", path);
      });

      svg.call(dragBehavior);

      const zoomBehavior = d3.zoom().on("zoom", (event) => {
        const newScale = Math.max(
          100,
          Math.min(width / 2, event.transform.k * (width / 3))
        );
        projection.scale(newScale);
        svg.selectAll("path").attr("d", path);
      });

      svg.call(zoomBehavior);
    }
  }, [visaData, countryNames]);

  // Replace the return statement with this
  return (
    <>
      <div
        ref={globeRef}
        style={{ width: "100%", minHeight: "400px", height: "100%" }}
      />
      <div 
        ref={tooltipRef}
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          pointerEvents: "none"
        }}
      />
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
              maxWidth: 'none',
            }
          }
        }}
      />
    </>
  );
};

export default GlobeVisa;
