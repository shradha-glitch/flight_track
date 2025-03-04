import { useEffect, useRef, useState } from "react"; // Import hooks for managing side effects and references
import * as d3 from "d3"; // Import D3.js for data visualization
import { Box, CircularProgress } from "@mui/material";

const ParallelCoordinates = () => {
  const chartRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenDimensions, setScreenDimensions] = useState({
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.6,
  });
  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.6,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSourceCountry = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8001/api/flights/forlondon`
        );
        const result = await response.json();
        const iataCodes = result.map((item) => item.destination);
        const departureDates = result.map((item) => item.departureDate);
        const returnDates = result.map((item) => item.returnDate);
        const weatherPromises = iataCodes.map(async (iataCode, index) => {
          const weatherResponse = await fetch(
            `http://127.0.0.1:8001/api/weather/${iataCode}?departure_date=${departureDates[index]}&return_date=${returnDates[index]}`
          );

          const weatherData = await weatherResponse.json();
          return {
            iataCode,
            temperature: weatherData.average_temperature,
          };
        });

        const weatherData = await Promise.all(weatherPromises);
        const advisoryPromises = iataCodes.map(async (iataCode) => {
          const advisoryResponse = await fetch(
            `http://127.0.0.1:8001/api/destinations/travel-advisory/`
          );
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
        const updatedData = result.map((item) => {
          const weather = weatherData.find(
            (w) => w.iataCode === item.destination
          );
          const advisory = advisoryData.find(
            (a) => a.iataCode === item.destination
          );

          return {
            name: item.destination,
            A: parseFloat(item.price.total),
            B: weather ? weather.temperature : Math.random() * 40,
            C: Math.random() * 100,
            D: advisory ? advisory.advisory : "None",
            E: Math.random() > 0.5 ? 1 : 0,
            F: item.destination_info.travel_days,
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
    if (data.length === 0) return;
    setLoading(false);
    const { width, height } = screenDimensions;
    const margin = { top: 40, right: 80, bottom: 50, left: 45 };
    d3.select(chartRef.current).selectAll("*").remove();
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const dimensions = Object.keys(data[0]).filter((d) => d !== "name");
    const yScales = {};
    dimensions.forEach((dim) => {
      if (dim === "D") {
        yScales[dim] = d3
          .scalePoint()
          .domain([
            "None",
            "No advisory",
            "Advisory against travel to certain areas",
            "Advisory against non-essential travel",
            "Advisory against all travel",
          ])
          .range([height - margin.bottom, margin.top]);
      } else {
        yScales[dim] = d3
          .scaleLinear()
          .domain(d3.extent(data, (d) => d[dim]))
          .range([height - margin.bottom, margin.top]);
      }
    });
    const xScale = d3
      .scalePoint()
      .domain(dimensions)
      .range([margin.left + 30, width - margin.right - 30]);
    const tooltip = d3
      .select(chartRef.current)
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

    const colorScale = d3
      .scaleSequential(d3.interpolateWarm)
      .domain([0, data.length - 1]);
    svg
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", (d, i) => colorScale(i))
      .attr("opacity", 0.75)
      .attr("stroke-width", 1)
      .attr("d", (d) =>
        d3.line()(dimensions.map((dim) => [xScale(dim), yScales[dim](d[dim])]))
      )
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", 4).attr("opacity", 1);
        tooltip
          .style("visibility", "visible")
          .html(`<strong>${d.name}</strong>`)
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 2).attr("opacity", 0.75);

        tooltip.style("visibility", "hidden");
      });
    const brush = d3
      .brushY()
      .extent([
        [-20, margin.top],
        [20, height - margin.bottom],
      ])
      .on("brush end", brushed);

    svg
      .selectAll("g.axis")
      .data(dimensions)
      .enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${xScale(d)},0)`)
      .each(function (d) {
        if (d === "D") {
          d3.select(this).call(d3.axisLeft(yScales[d]).tickFormat((d) => d));
        } else {
          d3.select(this).call(d3.axisLeft(yScales[d]));
        }
      })
      .append("g")
      .attr("class", "brush")
      .call(brush);

    const activeFilters = {};
    console.log(activeFilters);

    function brushed(event, dim) {
      if (event.selection === null) {
        delete activeFilters[dim];
      } else {
        if (dim === "D") {
          const [y0, y1] = event.selection;
          const selectedCategories = yScales[dim]
            .domain()
            .filter((category) => {
              const pos = yScales[dim](category);
              return pos >= y0 && pos <= y1;
            });
          activeFilters[dim] = selectedCategories;
        } else {
          const [y0, y1] = event.selection;
          activeFilters[dim] = [
            yScales[dim].invert(y1),
            yScales[dim].invert(y0),
          ];
        }
        updateHighlight();
      }

      function updateHighlight() {
        svg.selectAll("path").attr("opacity", (d) => {
          if (!d) return 0.1;
          return Object.keys(activeFilters).every((dim) => {
            if (!d.hasOwnProperty(dim) || d[dim] == null) return false;
            if (dim === "D") {
              return activeFilters[dim].includes(d[dim]);
            } else {
              const [min, max] = activeFilters[dim];
              return d[dim] >= min && d[dim] <= max;
            }
          })
            ? 1
            : 0.1;
        });
      }
    }
    const customLabels = {
      A: "Price",
      B: "Temperature",
      C: "Weather",
      D: "Safety",
      E: "Visa Requirements",
      F: "Flight Duration",
    };

    svg
      .selectAll(".axis-label")
      .data(dimensions)
      .enter()
      .append("text")
      .attr("class", "axis-label")
      .attr("x", (d) => xScale(d))
      .attr("y", margin.top - 25)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .style("font-weight", "bold")
      .text((d) => customLabels[d] || d);
  }, [data, screenDimensions]);
  return (
    <Box>
      <div ref={chartRef} className="w-full h-full " />{" "}
      {loading ? <CircularProgress /> : null}{" "}
    </Box>
  );
};
export default ParallelCoordinates;
