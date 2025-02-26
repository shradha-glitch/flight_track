import { use, useEffect, useRef, useState } from "react"; // Import hooks for managing side effects and references
import * as d3 from "d3"; // Import D3.js for data visualization

const ParallelCoordinates = () => {
    const chartRef = useRef(); // Reference to the div container where the chart will be drawn
    const [data, setData] = useState([]); // State to store data from the API
    const [source_country, setSourceCountry] = useState("LGW"); // State to store the source country

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
        // fetch data from the API
        const fetchSourceCountry = async (source_country) => {
            try {
                const response = await fetch(`http://127.0.0.1:8001/api/flights/forlondon?origin=${source_country}`);
                const result = await response.json();
                
                // Extract destination IATA codes and dates
                const iataCodes = result.map(item => item.destination);
                const departureDates = result.map(item => item.departureDate);
                const returnDates = result.map(item => item.returnDate);

                 // Fetch weather data for each destination
                 const weatherPromises = iataCodes.map(async (iataCode, index) => {
                    const weatherResponse = await fetch(`http://127.0.0.1:8001/weather/${iataCode}?departure_date=${departureDates[index]}&return_date=${returnDates[index]}`);
                    
                    const weatherData = await weatherResponse.json();
                    return {
                        iataCode,
                        temperature: weatherData.average_temperature
                    };
                })

                const weatherData = await Promise.all(weatherPromises);

                console.log("Weather Data", weatherData);
            
                const updatedData = result.map(item => {
                    const weather = weatherData.find(w => w.iataCode === item.destination);
                    return {
                        name: item.destination,
                        A: parseFloat(item.price.total), // Extract and parse the price
                        B: weather ? weather.temperature : Math.random() * 40, // Use fetched temperature data or fake data
                        C: Math.random() * 100, // Fake weather data (0 to 100)
                        D: Math.random() * 10, // Fake safety data (0 to 10)
                        E: Math.random() > 0.5 ? 1 : 0, // Fake visa requirements data (0 or 1)
                        F: Math.random() * 15 // Fake flight duration data (0 to 15 hours)
                    };
                });
                setData(updatedData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };
        fetchSourceCountry(source_country);
    }, [source_country]);

    useEffect(() => {
        if (data.length === 0) return; // Do nothing if data is not loaded yet

        // ----------------------
        // 2. Chart Dimensions (Balanced Margins for Centering)
        // ----------------------
        const width = 1400, // Increased width slightly for better spacing
            height = 400,  // Increased height for readability
            margin = { top: 40, right: 80, bottom: 50, left: 45 }; // Balanced margins

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
            yScales[dim] = d3.scaleLinear()
                .domain(d3.extent(data, d => d[dim])) // Get min/max values for each dimension
                .range([height - margin.bottom, margin.top]); // Scale to fit within the SVG
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
        svg.selectAll("g.axis")
            .data(dimensions) // Bind dimension names to axis groups
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr("transform", d => `translate(${xScale(d)},0)`) // Position axes
            .each(function (d) { d3.select(this).call(d3.axisLeft(yScales[d])); }); // Draw each axis

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

    }, [data]); // Re-run effect when data changes

    // ----------------------
    // 11. Return JSX (Chart Container)
    // ----------------------
    return <div ref={chartRef} />; // A div where the D3 chart will be drawn
};

export default ParallelCoordinates;