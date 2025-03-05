import { useEffect, useRef, useState } from "react"; // Import hooks for managing side effects and references
import * as d3 from "d3"; // Import D3.js for data visualization
import LinearProgress from '@mui/material/LinearProgress';

const ParallelCoordinates = ( {onFilterChange}) => {
    const chartRef = useRef(); // Reference to the div container where the chart will be drawn
    const [data, setData] = useState([]); // State to store data from the API
    const [screenDimensions, setScreenDimensions] = useState({
      width: window.innerWidth * 0.9,  // 90% of screen width
      height: window.innerHeight * 0.6 // 20% of screen height
  });
    const [originalFlightData, setOriginalFlightData] = useState([]);
    const [loading, setLoading] = useState(true);
    

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
                const response = await fetch(`http://127.0.0.1:8001/api/flights/forlondon`);
                const result = await response.json();
                setOriginalFlightData(result);
                
                // Extract destination IATA codes and dates
                const iataCodes = result.map(item => item.destination);
                const departureDates = result.map(item => item.departureDate);
                const returnDates = result.map(item => item.returnDate);

                

                 // Fetch weather data for each destination
                 const weatherPromises = iataCodes.map(async (iataCode, index) => {
                    const weatherResponse = await fetch(`http://127.0.0.1:8001/api/weather/${iataCode}?departure_date=${departureDates[index]}&return_date=${returnDates[index]}`);
                    const weatherData = await weatherResponse.json();
                    console.log("Weather Data",weatherData.climate);
                    return {
                        iataCode,
                        temperature: weatherData.average_temperature,
                        climate: weatherData.climate,

                    };
                })

                const weatherData = await Promise.all(weatherPromises);

                const advisoryPromises = iataCodes.map(async (iataCode) => {
                    const advisoryResponse = await fetch(`http://127.0.0.1:8001/api/destinations/travel-advisory/`);
                    const advisoryData = await advisoryResponse.json();

                    if (!advisoryData.advisories || !advisoryData.advisories[iataCode]) {
                      console.error(`No advisory found for ${iataCode}`);
                      return null;
                  }

              
                  const advisoryInfo = advisoryData.advisories[iataCode];

                    return {
                        iataCode: advisoryInfo.iata,
                        iso: advisoryInfo.iso,
                        countryName: advisoryInfo.advisory.country_name,
                        advisory: advisoryInfo.advisory.advice,

                    };
                });

                const advisoryData = await Promise.all(advisoryPromises);
            
                const updatedData = result.map(item => {
                    const weather = weatherData.find(w => w.iataCode === item.destination);
                    const advisory = advisoryData.find(a => a.iataCode === item.destination);                    
                    return {
                        name: item.destination,
                        A: parseFloat(item.price.total), // Extract and parse the price
                        B: weather ? weather.temperature : Math.random() * 40, // Use fetched temperature data or fake data
                        C: weather ? weather.climate : "None", // Fake weather data (0 to 100)
                        D: advisory ? advisory.advisory : "None",
                        E: Math.random() > 0.5 ? 1 : 0, // Fake visa requirements data (0 or 1)
                        F: item.destination_info.travel_days,
                        originalFlight: item
                    };
                });
                setData(updatedData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data: ", error);
                setLoading(false);
            }
        };
        fetchSourceCountry();
    }, []);

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
                    .html(`<strong>${d.name}</strong>`)
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
        .extent([[ -20, margin.top], [20, height - margin.bottom]]) 
        .on("brush end", brushed); 


        svg.selectAll("g.axis")
            .data(dimensions) 
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr("transform", d => `translate(${xScale(d)},0)`) 
            .each(function (d) {
                 if (d === "D" || d === "C") {
                    d3.select(this).call(d3.axisLeft(yScales[d]).tickFormat(d => d)); 
                } else {
                    d3.select(this).call(d3.axisLeft(yScales[d]));
                }
            }) 
            .append("g") 
            .attr("class", "brush")
            .call(brush);


          const activeFilters = {};

          function brushed(event, dim) {
              if (event.selection === null) {
                  delete activeFilters[dim]; 
              } else {
                if (dim === "D" || dim === "C") {
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
                        if (dim === "D" || dim === "C") {
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
                            duration: d.F
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
            A: "Price",
            B: "Temperature",
            C: "Climate",
            D: "Safety",
            E: "Visa Requirements",
            F: "Trip Duration"
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
            .text(d => customLabels[d] || d); // Use custom label if available

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
              <div ref={chartRef} className="w-full h-full" />
          )}
      </div>
  );
};

export default ParallelCoordinates;