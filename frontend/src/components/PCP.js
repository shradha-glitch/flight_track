import { useEffect, useRef, useState } from "react"; // Import hooks for managing side effects and references
import * as d3 from "d3"; // Import D3.js for data visualization
import LinearProgress from '@mui/material/LinearProgress';
import InfoIcon from '@mui/icons-material/Info';
import { Typography } from '@mui/material';
import { API_URL } from '../constants';

const ParallelCoordinates = ( {onFilterChange, passportIsoCode, departureDate} ) => {
    const chartRef = useRef(); // Reference to the div container where the chart will be drawn
    const [data, setData] = useState([]); // State to store data from the API
    // Update the screen dimensions calculation
    const [screenDimensions, setScreenDimensions] = useState({
        width: Math.max(window.innerWidth * 0.85, 800),  // Minimum width of 800px
        height: Math.max(window.innerHeight * 0.65, 500) // Minimum height of 500px
    });
    const [originalFlightData, setOriginalFlightData] = useState([]);
    const [visaDetails, setVisaDetails] = useState([]);

    const [loading, setLoading] = useState(true);
    
    // Update the resize handler
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
    
    // Update the margin and styling in the chart creation
    useEffect(() => {
        if (data.length === 0) return;
    
        const { width, height } = screenDimensions;
        const margin = { 
            top: Math.max(height * 0.08, 40),     // Responsive margins
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
        // fetch data from the API
        const fetchSourceCountry = async () => {
            try {
                const response = await fetch(`${API_URL}/api/flights/forlondon?departure_date=${departureDate}`);
                const result = await response.json();
                setOriginalFlightData(result);
                
                // Extract destination IATA codes and dates
                const isoCodes = result.map(item => item.destination_info.iso_code);
                const iataCodes = result.map(item => item.destination);
                const departureDates = result.map(item => item.departureDate);
                const returnDates = result.map(item => item.returnDate);

                // Fetch all weather data in a single API call
                const weatherResponse = await fetch(`${API_URL}/api/neooneweather?departure_date=${departureDate}`);
                const allWeatherData = await weatherResponse.json();
                

               // Process weather data for each destination
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


                // Fetch all travel advisory data in a single API call
                const advisoryResponse = await fetch(`${API_URL}/api/destinations/travel-advisory/`);
                const advisoryData = await advisoryResponse.json();

                // Process advisory data for each destination
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


                // Fetch visa data in a single API call
                const visaResponse = await fetch(`${API_URL}/api/pcpvisa?country_codes=${passportIsoCode.join(',')}&departure_date=${departureDate}`);
                const allVisaData = await visaResponse.json();

                // Process visa data for each destination
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
                // Store visa details by country code
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


    // Function to determine the worst visa requirement
    const getWorstVisaRequirement = (visaData) => { 
        const visaRequirements = visaData.visaRequirements; 
        let worstVisa = "unknown"; // Default to visa free
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


    // Loop through the visaRequirements object
        for (let countryCode in visaRequirements) {
            let visaRequirement = visaRequirements[countryCode];

            if (visaRequirement === -1) {
                visaRequirement = "home country";
            } else if (!isNaN(visaRequirement)) {
                visaRequirement = "visa with day limit";
            }

            // Compare and update worstVisa if the current visa has a worse priority
            if (visaPriority[visaRequirement] > visaPriority[worstVisa]) {
                worstVisa = visaRequirement;  // Update worstVisa
            }
        }
        // console.log("Worst visa requirement:", worstVisa);
        return worstVisa;
    };

    

    useEffect(() => {
        if (data.length === 0) return; // Do nothing if data is not loaded yet

        // ----------------------
        // 2. Chart Screen Dimensions (Balanced Margins for Centering)
        // ----------------------
        const { width, height } = screenDimensions; // Container dimensions
        const margin = { top: 40, right: 80, bottom: 50, left: 45 }; // Space around the chart
        // ----------------------
        // 3. Clear Existing Chart Before Redrawing
        // ----------------------
        d3.select(chartRef.current).selectAll("*").remove(); // Remove previous chart if it exists

        // ----------------------
        // 4. Create SVG Element
        // ----------------------
        const svg = d3.select(chartRef.current) // Select the container div
            .append("svg") // Append an SVG element
            .attr("width", width) // Set width
            .attr("height", height) // Set height
            .append("g") // Append a group element for margins
            .attr("transform", `translate(${margin.left},${margin.top})`); // Adjust for margins

        // ----------------------
        // 5. Define Scales for Each Axis
        // ----------------------
        const dimensions = Object.keys(data[0]).filter(d => d !== "name" && d !== "originalFlight"); // Exclude "name" field
        const yScales = {}; // Object to store y-scales for each dimension

        dimensions.forEach(dim => {
            if (dim === "C") {
                // Use ordinal scale for weather category
                yScales[dim] = d3.scalePoint()
                    .domain(["None", "Sunny", "Partly Clouded", "Cloudy", "Rainy", "Snowy"])
                    .range([height - margin.bottom, margin.top]); // Flip so higher numbers are at the top
            }else if (dim === "D") {
                // Use ordinal scale for advisory category
                yScales[dim] = d3.scalePoint()
                    .domain(["None", "No advisory", "Advisory against travel to certain areas", "Advisory against non-essential travel", "Advisory against all travel"])
                    .range([height - margin.bottom, margin.top]); // Flip so higher numbers are at the top
            }
            else if (dim === "E") {
                // Use ordinal scale for visa category
                yScales[dim] = d3.scalePoint()
                    .domain(["unknown", "home country", "visa free", "visa with day limit", "eta", "e-visa", "visa on arrival", "visa required"])
                    .range([height - margin.bottom, margin.top]); // Flip so higher numbers are at the top
            } else {
                yScales[dim] = d3.scaleLinear()
                    .domain(d3.extent(data, d => d[dim])) // Get min/max values
                    .range([height - margin.bottom, margin.top]);
            }
        });

        // ----------------------
        // 6. Define X-Axis Scale for Dimension Placement
        // ----------------------
        const xScale = d3.scalePoint()
            .domain(dimensions)
            .range([margin.left + 30, width - margin.right - 30]); // Add padding on both sides

        // ----------------------
        // 7. Tooltip for Hover Effect
        // ----------------------
        const tooltip = d3.select(chartRef.current)
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#e0e0e0") // Light gray background
            .style("color", "black") // Black text
            .style("border", "1px solid black")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("font-size", "14px")
            .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.2)");

        // ----------------------
        // 8. Draw Lines (Paths) for Each Data Entry
        // ----------------------
        const colorScale = d3.scaleSequential(d3.interpolateWarm).domain([0, data.length - 1]); // Color scale for lines
        // Modify the mouseover, mouseout events in the path creation section
        svg.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", (d, i) => colorScale(i))
            .attr("opacity", 0.75)
            .attr("stroke-width", 1) // Slightly thicker lines for better visibility
            .attr("d", d => d3.line()(dimensions.map(dim => [xScale(dim), yScales[dim](d[dim])])))
            .on("mouseover", function (event, d) {
                // Only highlight if the line is already visible (part of filtered results)
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

        // ----------------------
        // 9. Draw Axes for Each Dimension
        // ----------------------

        
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
            .each(function(d) {  // Pass dimension `d` properly to each brush
                d3.select(this)
                    .call(brush) 
                    .on("brush end", function(event) { 
                        brushed(event, d);  // Ensure dimension `d` is passed correctly
                    });
            })
            .style("stroke", "#ccc") // Reset to original color
            .style("stroke-width", "1px") // Restore original thickness
            .style("opacity", 0.8) // Slight fade-out for smooth effect
            .on("mouseover", function () {
                d3.select(this)
                    .style("stroke", "#CBC5B1") // Change stroke color for highlight
                    .style("stroke-width", "2px") // Slightly thicker for visibility
                    .style("opacity", 1); // Ensure visibility
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("stroke", "#ccc") // Reset to original color
                    .style("stroke-width", "1px") // Restore original thickness
                    .style("opacity", 0.8); // Slight fade-out for smooth effect
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