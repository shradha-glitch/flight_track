import { useEffect, useRef, useState } from "react"; 
import * as d3 from "d3";
import LinearProgress from '@mui/material/LinearProgress';
import { Typography } from '@mui/material';
import { API_URL } from '../constants';

const ParallelCoordinates = ( {onFilterChange, passportIsoCode, departureDate} ) => {
    const chartRef = useRef();
    const [data, setData] = useState([]); 
    const [originalFlightData, setOriginalFlightData] = useState([]);
    const [screenDimensions, setScreenDimensions] = useState({
        width: Math.max(window.innerWidth * 0.85, 800),  
        height: Math.max(window.innerHeight * 0.65, 500) 
    });
    const [visaDetails, setVisaDetails] = useState([]);

    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const handleResize = () => {
            setScreenDimensions({
                width: Math.max(window.innerWidth * 0.85, 800),
                height: Math.max(window.innerHeight * 0.65, 500)
            });
        };
    
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    
    useEffect(() => {
        if (data.length === 0) return;
    
        const { width, height } = screenDimensions;
        const margin = { 
            top: Math.max(height * 0.08, 40),    
            right: Math.max(width * 0.06, 80),
            bottom: Math.max(height * 0.1, 50),
            left: Math.max(width * 0.04, 45)
        };
    });
    
        useEffect(() => {
          const handleResize = () => {
              setScreenDimensions({
                  width: window.innerWidth * 0.9,
                  height: window.innerHeight * 0.6
              });
          };

          window.addEventListener("resize", handleResize);
          return () => window.removeEventListener("resize", handleResize);
      }, []);
    


    useEffect(() => {
        const fetchSourceCountry = async () => {
            try {
                const response = await fetch(`${API_URL}/api/flights/forlondon?departure_date=${departureDate}`);
                const result = await response.json();
                setOriginalFlightData(result);
                
                const isoCodes = result.map(item => item.destination_info.iso_code);
                const iataCodes = result.map(item => item.destination);
                const departureDates = result.map(item => item.departureDate);
                const returnDates = result.map(item => item.returnDate);

                const weatherResponse = await fetch(`${API_URL}/api/neooneweather?departure_date=${departureDate}`);
                const allWeatherData = await weatherResponse.json();
                
                const weatherData = iataCodes.map(iataCode => {
                const destinationWeather = allWeatherData.destinations[iataCode];
                if (!destinationWeather) return { iataCode, temperature: Math.random() * 40, climate: "None" };
                
                return {
                    iataCode,
                    temperature: destinationWeather.average_temperature,
                    climate: destinationWeather.dominant_climate,
                    climate_breakdown: destinationWeather.weather_breakdown,
                    daily_temperature: destinationWeather.daily_temperature,
                    daily_cloud_cover: destinationWeather.daily_cloud_cover,
                    daily_radiation_sum: destinationWeather.daily_radiation_sum,
                    daily_rain_sum: destinationWeather.daily_rain_sum,
                    daily_snowfall_sum: destinationWeather.daily_snowfall_sum
                };
            });

                const advisoryResponse = await fetch(`${API_URL}/api/destinations/travel-advisory/`);
                const advisoryData = await advisoryResponse.json();

                const advisoryInfo = iataCodes.map(iataCode => {
                    if (!advisoryData.advisories || !advisoryData.advisories[iataCode]) {
                        return { iataCode, advisory: "None" };
                    }
                    
                    const advisory = advisoryData.advisories[iataCode];
                    return {
                        iataCode: advisory.iata,
                        iso: advisory.iso,
                        countryName: advisory.advisory.country_name,
                        advisory: advisory.advisory.advice,
                    };
                });


                const visaResponse = await fetch(`${API_URL}/api/pcpvisa?country_codes=${passportIsoCode.join(',')}&departure_date=${departureDate}`);
                const allVisaData = await visaResponse.json();

                const visaData = iataCodes.map(iataCode => {
                    const destinationRequirements = allVisaData.destination_requirements[iataCode] || {};
                    return {
                        visaRequirements: destinationRequirements
                    };
                });

            
                const updatedData = result.map((item, index )=> {
                    const weather = weatherData.find(w => w.iataCode === item.destination);
                    const advisory = advisoryInfo.find(a => a.iataCode === item.destination); 
                    const visaRequirement = getWorstVisaRequirement(visaData[index]);
                    return {
                        name: item.destination,
                        A: parseFloat(item.price.total),
                        B: weather ? weather.temperature : Math.random() * 40, 
                        C: weather ? weather.climate : "None", 
                        D: advisory ? advisory.advisory : "None",
                        E: visaRequirement || "unknown",
                        F: item.destination_info.travel_days,
                        originalFlight: item
                    };
                });
                setData(updatedData);
                setLoading(false);
                const extractedVisaDetails = {};
                visaData.forEach((data, index) => {
                    const visaRequirements = data.visaRequirements;
                    const formattedVisaRequirements = {};
                
                    Object.entries(visaRequirements).forEach(([key, value]) => {
                        if (value === -1) {
                            formattedVisaRequirements[key] = "Home country";
                        } else if (typeof value === 'number') {
                            formattedVisaRequirements[key] = `${value} days`;
                        } else {
                            formattedVisaRequirements[key] = value;
                        }
                    });
                
                    extractedVisaDetails[result[index].destination] = formattedVisaRequirements;
                });
                setVisaDetails(extractedVisaDetails);
            } catch (error) {
                console.error("Error fetching data: ", error);
                setLoading(false);
            }
        };
        fetchSourceCountry();
    }, [passportIsoCode, departureDate]);


    const getWorstVisaRequirement = (visaData) => { 
        const visaRequirements = visaData.visaRequirements; 
        let worstVisa = "unknown"; 
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


        for (let countryCode in visaRequirements) {
            let visaRequirement = visaRequirements[countryCode];

            if (visaRequirement === -1) {
                visaRequirement = "home country";
            } else if (!isNaN(visaRequirement)) {
                visaRequirement = "visa with day limit";
            }
            if (visaPriority[visaRequirement] > visaPriority[worstVisa]) {
                worstVisa = visaRequirement;  // Update worstVisa
            }
        }
        return worstVisa;
    };

    

    useEffect(() => {
        if (data.length === 0) return;

        const { width, height } = screenDimensions; 
        const margin = { top: 40, right: 80, bottom: 50, left: 45 }; 
       
        d3.select(chartRef.current).selectAll("*").remove(); 

        const svg = d3.select(chartRef.current) 
            .append("svg")
            .attr("width", width) 
            .attr("height", height) 
            .append("g") 
            .attr("transform", `translate(${margin.left},${margin.top})`); 

        const dimensions = Object.keys(data[0]).filter(d => d !== "name" && d !== "originalFlight"); 
        const yScales = {};

        dimensions.forEach(dim => {
            if (dim === "C") {
                yScales[dim] = d3.scalePoint()
                    .domain(["None", "Sunny", "Partly Clouded", "Cloudy", "Rainy", "Snowy"])
                    .range([height - margin.bottom, margin.top]); 
            }else if (dim === "D") {
                yScales[dim] = d3.scalePoint()
                    .domain(["None", "No advisory", "Advisory against travel to certain areas", "Advisory against non-essential travel", "Advisory against all travel"])
                    .range([height - margin.bottom, margin.top]);
            }
            else if (dim === "E") {
                yScales[dim] = d3.scalePoint()
                    .domain(["unknown", "home country", "visa free", "visa with day limit", "eta", "e-visa", "visa on arrival", "visa required"])
                    .range([height - margin.bottom, margin.top]); 
            } else {
                yScales[dim] = d3.scaleLinear()
                    .domain(d3.extent(data, d => d[dim])) 
                    .range([height - margin.bottom, margin.top]);
            }
        });

        const xScale = d3.scalePoint()
            .domain(dimensions)
            .range([margin.left + 30, width - margin.right - 30]); 

        const tooltip = d3.select(chartRef.current)
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#e0e0e0") 
            .style("color", "black") 
            .style("border", "1px solid black")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("font-size", "14px")
            .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.2)");

        const colorScale = d3.scaleSequential(d3.interpolateWarm).domain([0, data.length - 1]);
        svg.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", (d, i) => colorScale(i))
            .attr("opacity", 0.75)
            .attr("stroke-width", 1) 
            .attr("d", d => d3.line()(dimensions.map(dim => [xScale(dim), yScales[dim](d[dim])])))
            .on("mouseover", function (event, d) {
                
                if (this.getAttribute("opacity") === "1") {
                    d3.select(this)
                        .attr("stroke-width", 4)
                        .attr("opacity", 1);
                    tooltip.style("visibility", "visible")
                    .html(`<strong>${d.originalFlight.destination_info.city_name}, ${d.originalFlight.destination_info.iso_code}</strong>`)
                    .style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
                }
            })
            .on("mousemove", function (event) {
                if (this.getAttribute("opacity") === "1") {
                    tooltip.style("top", `${event.pageY - 10}px`)
                        .style("left", `${event.pageX + 10}px`);
                }
            })
            .on("mouseout", function () {
                if (this.getAttribute("opacity") === "1") {
                    d3.select(this)
                        .attr("stroke-width", 2)
                        .attr("opacity", 1);
    
                    tooltip.style("visibility", "hidden");
                }
            });
        
        const brush = d3.brushY()
        .extent([[ -10, margin.top], [10, height - margin.bottom]]) 
        .on("brush end", brushed); 


        svg.selectAll("g.axis")
            .data(dimensions) 
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr("transform", d => `translate(${xScale(d)},0)`) 
            .each(function (d) {
                 if (d === "D" || d === "C" || d === "E") {
                    d3.select(this).call(d3.axisLeft(yScales[d]).tickFormat(d => d)); 
                } else {
                    d3.select(this).call(d3.axisLeft(yScales[d]));
                }
            }) 
            .append("g") 
            .attr("class", "brush")
            .each(function(d) { 
                d3.select(this)
                    .call(brush) 
                    .on("brush end", function(event) { 
                        brushed(event, d);  
                    });
            })
            .style("stroke", "#ccc") 
            .style("stroke-width", "1px") 
            .style("opacity", 0.8) 
            .on("mouseover", function () {
                d3.select(this)
                    .style("stroke", "#CBC5B1") 
                    .style("stroke-width", "2px")
                    .style("opacity", 1); 
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("stroke", "#ccc") 
                    .style("stroke-width", "1px") 
                    .style("opacity", 0.8); 
            });

          const activeFilters = {};

          function brushed(event, dim) {
              if (!event.selection) {
                delete activeFilters[dim]; 
                updateHighlight();
              } else {
                if (dim === "D" || dim === "C" || dim === "E") {
                    const [y0, y1] = event.selection;
                    const selectedCategories = yScales[dim].domain().filter(category => {
                        const pos = yScales[dim](category);
                        return pos >= y0 && pos <= y1;
                    });
                    activeFilters[dim] = selectedCategories;
                } else {
                  const [y0, y1] = event.selection;
                  activeFilters[dim] = [yScales[dim].invert(y1), yScales[dim].invert(y0)]; 
              }
              updateHighlight();
          }

          
          function updateHighlight() {
            const filteredDestinations = []; // Create array to store filtered destinations

            svg.selectAll("path")
                .attr("opacity", d => {
                    if (!d) return 0.1; 
        
                    const isHighlighted = Object.keys(activeFilters).every(dim => {
                        if (!d.hasOwnProperty(dim) || d[dim] == null) return false; // Avoid null errors
                        if (dim === "D" || dim === "C" || dim === "E") {
                            return activeFilters[dim].includes(d[dim]);
                        } else {
                            const [min, max] = activeFilters[dim];
                            return d[dim] >= min && d[dim] <= max;
                        }
                    });
        
                    // If the line is highlighted, add its destination to the filtered list
                    if (isHighlighted) {
                        filteredDestinations.push({
                          ...d.originalFlight,
                          pcp: {
                            temp: d.B,
                            weather: d.C,
                            safety: d.D,
                            visa: d.E,
                            duration: d.F,
                            visaDetails: visaDetails[d.name]
                            
                          }
                        });
                    }
        
                    return isHighlighted ? 1 : 0.1;
                });
                onFilterChange(filteredDestinations);
              }
        }
        
            

        // ----------------------
        // 10. Axis Labels (Properly Positioned)
        // ----------------------
        const customLabels = {
            A: "Price(£)",
            B: "Temperature(C°)",
            C: "Climate",
            D: "Safety",
            E: "Visa Requirements",
            F: "Trip Duration(Days)"
        };

        svg.selectAll(".axis-label")
            .data(dimensions)
            .enter()
            .append("text")
            .attr("class", "axis-label")
            .attr("x", d => xScale(d)) // Center labels on axes
            .attr("y", margin.top - 25) // Higher positioning for readability
            .attr("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-size", "14px")
            .style("fill", "#333") // Dark gray text
            .style("font-weight", "bold") // Make labels bold for better visibility
            .text(d => customLabels[d] || d) // Use custom label if available
            .each(function(d){
                const label = d3.select(this);
                label.append("tspan")
                    .attr("dx", "0.1em")
                    .attr("dy", "0em")
                    .text("⋮⋮")
                    .style("font-size", "12px")
                    .style("opacity", 0)
                    .style("fill", "#666");
            })
            .on("mouseover", function() {
                d3.select(this).select("tspan").style("opacity", 1);
                d3.select(this)
                    .style("fill", "#000")
                   .style("text-shadow", "1px 1px 5px rgba(246, 174, 58, 0.8)");
            })
            .on("mouseout", function() {
                if (!d3.select(this).classed("active")) {
                    d3.select(this).select("tspan")
                        .style("opacity", 0);  // Hide drag indicator
                    d3.select(this)
                        .style("fill", "#333")
                        .style("text-shadow", "none");
                }
            })
            .call(d3.drag()
                .on("start", function(event, d) {
                    d3.select(this)
                    .raise()
                    .classed("active", true)
                    .style("cursor", "grabbing")
                    .select("tspan")
                    .style("opacity",1);
                })
                .on("drag", function(event, d) {
                    const currentX = event.x;
                    const currentIndex = dimensions.indexOf(d);
                    let targetIndex = dimensions.findIndex(dim => xScale(dim) > currentX);
                    if (targetIndex === -1) targetIndex = dimensions.length - 1;
                    if (targetIndex === currentIndex) return;
                    dimensions.splice(currentIndex, 1);
                    dimensions.splice(targetIndex, 0, d);
                    xScale.domain(dimensions);
                    svg.selectAll("g.axis").attr("transform", dim => `translate(${xScale(dim)},0)`);
                    svg.selectAll(".axis-label").attr("x", dim => xScale(dim));
                    svg.selectAll("path").attr("d", function(d) {if (!d) return ""; return d3.line()(dimensions.map(dim => [xScale(dim), yScales[dim](d[dim])])); }); })
                    .on("end", function(event, d) {
                        d3.select(this).classed("active", false);
                    })
                );

            svg.selectAll(".axis-label")
            .filter(d => d === "E")
            .each(function(d) {
                const label = d3.select(this);
                label.append("tspan")
                    .attr("dx", "-0.1em")
                    .attr("dy", "0em")
                    .style("cursor", "pointer")
                    .text("ℹ️")
                    .on("click", () => {
                        alert("Visa Requirements Information:\n\n" +
                            "- Unknown: No information is available regarding visa requirements for the destination.\n\n" +
                            "- Home country: Travel within or to your home country doesn’t require a visa.\n\n" +
                            "- Visa free: No visa is required for entry to the destination.\n\n" +
                            "- Visa with day limit: A visa is required, but there is a limit on the number of days you can stay.\n\n" +
                            "- ETA: An Electronic Travel Authorization (ETA) is required before entry, usually for short visits.\n\n" +
                            "- E-visa: An electronic visa must be obtained online before traveling.\n\n" +
                            "- Visa on arrival: A visa can be obtained upon arrival at the destination.\n\n" +
                            "- Visa required: A visa must be obtained before traveling to the destination.");
                    });
            });

    }, [data, screenDimensions]); // Re-run effect when data changes


    // ----------------------
    // 11. Return JSX (Chart Container)
    // ----------------------
    return (
      <div className="w-full h-full">
          {loading ? (
            <div 
            className="flex justify-center items-center h-full">
            <LinearProgress
                color="inherit"
                sx={{
                '& .MuiLinearProgress-bar': {
                background: "linear-gradient(to right, rgb(251, 150, 51), rgb(255, 120, 71), rgb(255, 94, 99), rgb(254, 75, 131), rgb(228, 65, 157))",
                },
                }}
            />
            </div>
        ) : ( 
            <>
            <Typography 
            variant="h6" 
            sx={{ 
                textAlign: 'center', 
                mb: 3,
                color: '#666',
                fontWeight: 'medium',
            }}
            >
              Find your perfect flight - Filter based on your preferences - Drag axes to reorder and explore relationships
            </Typography>
            <div ref={chartRef} className="w-full h-full" />
          </>
        )}
      </div>
  );

};


export default ParallelCoordinates;