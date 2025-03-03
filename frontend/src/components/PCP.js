import { useEffect, useRef, useState } from "react"; // Import hooks for managing side effects and references
import * as d3 from "d3"; // Import D3.js for data visualization

const ParallelCoordinates = ( {onFilterChange}) => {
    const chartRef = useRef(); // Reference to the div container where the chart will be drawn
    const [data, setData] = useState([]); // State to store data from the API
    const [screenDimensions, setScreenDimensions] = useState({
      width: window.innerWidth * 0.9,  // 90% of screen width
      height: window.innerHeight * 0.6 // 20% of screen height
  });
    
    // useEffect(() => {
        // // ----------------------
        // // 1. Sample Data
        // // ----------------------
        // const data = [
        //     { name: "Sarajevo, BA", A: 10, B: 20, C: 30, D: 50, E: 0, F: 3 },
        //     { name: "Delhi, IN",A: 20, B: 30, C: 40, D: 70, E: 1, F: 27 },
        //     { name: "Stockholm, SE",A: 30, B: 10, C: 45, D: 65, E: 1, F: 13 },
        //     { name: "Madrid, ES",A: 40, B: 20, C: 60, D: 35, E: 0, F: 20 },
        // ];


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

        const advisoryDummieData = [
            {
              "iataCode": "AKL",
              "iso2Code": "NZ",
              "advisory": "Advisory against all travel"
            },
            {
              "iataCode": "BNE",
              "iso2Code": "AU",
              "advisory": "Advisory against non-essential travel"
            },
            {
              "iataCode": "CPT",
              "iso2Code": "ZA",
              "advisory": "Advisory against travel to certain areas"
            },
            {
              "iataCode": "MEL",
              "iso2Code": "AU",
              "advisory": "No advisory"
            },
            {
              "iataCode": "LOS",
              "iso2Code": "NG",
              "advisory": "None"
            },
            {
              "iataCode": "LAS",
              "iso2Code": "US",
              "advisory": "Advisory against all travel"
            },
            {
              "iataCode": "HKT",
              "iso2Code": "TH",
              "advisory": "Advisory against non-essential travel"
            },
            {
              "iataCode": "JNB",
              "iso2Code": "ZA",
              "advisory": "Advisory against travel to certain areas"
            },
            {
              "iataCode": "MIA",
              "iso2Code": "US",
              "advisory": "No advisory"
            },
            {
              "iataCode": "DPS",
              "iso2Code": "ID",
              "advisory": "None"
            },
            {
              "iataCode": "NRT",
              "iso2Code": "JP",
              "advisory": "Advisory against all travel"
            },
            {
              "iataCode": "MNL",
              "iso2Code": "PH",
              "advisory": "Advisory against non-essential travel"
            },
            {
              "iataCode": "BKK",
              "iso2Code": "TH",
              "advisory": "Advisory against travel to certain areas"
            },
            {
              "iataCode": "KUL",
              "iso2Code": "MY",
              "advisory": "No advisory"
            },
            {
              "iataCode": "NRT",
              "iso2Code": "JP",
              "advisory": "None"
            },
            {
              "iataCode": "HKG",
              "iso2Code": "HK",
              "advisory": "Advisory against all travel"
            },
            {
              "iataCode": "BCN",
              "iso2Code": "ES",
              "advisory": "Advisory against non-essential travel"
            },
            {
              "iataCode": "TFS",
              "iso2Code": "ES",
              "advisory": "Advisory against travel to certain areas"
            },
            {
              "iataCode": "RAK",
              "iso2Code": "MA",
              "advisory": "No advisory"
            },
            {
              "iataCode": "PMI",
              "iso2Code": "ES",
              "advisory": "None"
            },
            {
              "iataCode": "FAO",
              "iso2Code": "PT",
              "advisory": "Advisory against all travel"
            },
            {
              "iataCode": "ATH",
              "iso2Code": "GR",
              "advisory": "Advisory against non-essential travel"
            },
            {
              "iataCode": "CPH",
              "iso2Code": "DK",
              "advisory": "Advisory against travel to certain areas"
            },
            {
              "iataCode": "ALC",
              "iso2Code": "ES",
              "advisory": "No advisory"
            },
            {
              "iataCode": "AGP",
              "iso2Code": "ES",
              "advisory": "None"
            },
            {
              "iataCode": "MAD",
              "iso2Code": "ES",
              "advisory": "Advisory against all travel"
            }
          ];

        // Map advisory categories to numbers
    const advisoryMapping = {
        "Advisory against all travel": 4,
        "Advisory against non-essential travel": 3,
        "Advisory against travel to certain areas": 2,
        "No advisory": 1,
        "None": 0
    };

    useEffect(() => {
        // fetch data from the API
        const fetchSourceCountry = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8001/api/flights/forlondon`);
                const result = await response.json();
                
                // Extract destination IATA codes and dates
                const iataCodes = result.map(item => item.destination);
                const departureDates = result.map(item => item.departureDate);
                const returnDates = result.map(item => item.returnDate);
                

                 // Fetch weather data for each destination
                 const weatherPromises = iataCodes.map(async (iataCode, index) => {
                    const weatherResponse = await fetch(`http://127.0.0.1:8001/api/weather/${iataCode}?departure_date=${departureDates[index]}&return_date=${returnDates[index]}`);
                    
                    const weatherData = await weatherResponse.json();
                    return {
                        iataCode,
                        temperature: weatherData.average_temperature
                    };
                })

                const weatherData = await Promise.all(weatherPromises);

            
                const updatedData = result.map(item => {

                    const weather = weatherData.find(w => w.iataCode === item.destination);
                    return {
                        name: item.destination,
                        A: parseFloat(item.price.total), // Extract and parse the price
                        B: weather ? weather.temperature : Math.random() * 40, // Use fetched temperature data or fake data
                        C: Math.random() * 100, // Fake weather data (0 to 100)
                        D: advisoryDummieData.find(a => a.iataCode === item.destination)?.advisory || "No advisory",  // Use fetched advisory data or default value
                        E: Math.random() > 0.5 ? 1 : 0, // Fake visa requirements data (0 or 1)
                        F: Math.random() * 15 // Fake flight duration data (0 to 15 hours)
                    };
                });
                setData(updatedData);
            } catch (error) {
                console.error("Error fetching data: ", error);
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
        const dimensions = Object.keys(data[0]).filter(d => d !== "name"); // Exclude "name" field
        const yScales = {}; // Object to store y-scales for each dimension

        dimensions.forEach(dim => {
            if (dim === "D") {
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
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        svg.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", (d, i) => colorScale(i))
            .attr("opacity", 0.75)
            .attr("stroke-width", 2) // Slightly thicker lines for better visibility
            .attr("d", d => d3.line()(dimensions.map(dim => [xScale(dim), yScales[dim](d[dim])])))
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("stroke-width", 4) // Highlight on hover
                    .attr("opacity", 1);

                    tooltip.style("visibility", "visible")
                    .html(`<strong>${d.name}</strong>`) // Show only the name, no numbers
                    .style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .attr("stroke-width", 2) // Reset thickness
                    .attr("opacity", 0.75);

                tooltip.style("visibility", "hidden");
            });

        // ----------------------
        // 9. Draw Axes for Each Dimension
        // ----------------------

        // Define brush for each axis
        const brush = d3.brushY()
        .extent([[ -20, margin.top], [20, height - margin.bottom]]) // Define the brushing area
        .on("brush end", brushed); // Call `brushed` function on interaction


        svg.selectAll("g.axis")
            .data(dimensions) // Bind dimension names to axis groups
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr("transform", d => `translate(${xScale(d)},0)`) // Position axes
            .each(function (d) {
                 if (d === "D") {
                    d3.select(this).call(d3.axisLeft(yScales[d]).tickFormat(d => d)); 
                } else {
                    d3.select(this).call(d3.axisLeft(yScales[d]));
                }
            }) // Draw each axis
            .append("g") // Add brush to each axis
            .attr("class", "brush")
            .call(brush);


          const activeFilters = {}; // Stores selected brush ranges
          console.log(activeFilters);

          function brushed(event, dim) {
              if (event.selection === null) {
                  delete activeFilters[dim]; // Remove filter if no selection
              } else {
                if (dim === "D") {
                    const [y0, y1] = event.selection;
                    const selectedCategories = yScales[dim].domain().filter(category => {
                        const pos = yScales[dim](category);
                        return pos >= y0 && pos <= y1;
                    });
                    activeFilters[dim] = selectedCategories;
                } else {
                  const [y0, y1] = event.selection;
                  activeFilters[dim] = [yScales[dim].invert(y1), yScales[dim].invert(y0)]; // Store inverted values
              }
          
              updateHighlight(); // Apply filter to the lines
          }

          
          function updateHighlight() {
            const filteredDestinations = []; // Create array to store filtered destinations
            
            svg.selectAll("path")
                .attr("opacity", d => {
                    if (!d) return 0.1; // Skip null or undefined data points
        
                    const isHighlighted = Object.keys(activeFilters).every(dim => {
                        if (!d.hasOwnProperty(dim) || d[dim] == null) return false; // Avoid null errors
                        if (dim === "D") {
                            return activeFilters[dim].includes(d[dim]);
                        } else {
                            const [min, max] = activeFilters[dim];
                            return d[dim] >= min && d[dim] <= max;
                        }
                    });
        
                    // If the line is highlighted, add its destination to the filtered list
                    if (isHighlighted) {
                        filteredDestinations.push(d.name);
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
            C: "Weather",
            D: "Safety",
            E: "Visa Requirements",
            F: "Flight Duration"
        };

        svg.selectAll(".axis-label")
            .data(dimensions)
            .enter()
            .append("text")
            .attr("class", "axis-label")
            .attr("x", d => xScale(d)) // Center labels on axes
            .attr("y", margin.top - 25) // Higher positioning for readability
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#333") // Dark gray text
            .style("font-weight", "bold") // Make labels bold for better visibility
            .text(d => customLabels[d] || d); // Use custom label if available

    }, [data, screenDimensions]); // Re-run effect when data changes

    // ----------------------
    // 11. Return JSX (Chart Container)
    // ----------------------
    return <div ref={chartRef} className="w-full h-full" />; // A div where the D3 chart will be drawn
};

export default ParallelCoordinates;