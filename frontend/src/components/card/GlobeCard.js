import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { drag } from "d3-drag";
import CustomCard from "./Card";

const fetchAdvisory = async (country_code) => {
  try {
    const response = await fetch(`https://flight-track.onrender.com/api/advisory/${country_code}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Fetching advisory for ${country_code} failed:`, error);
    return null;
  }
};

const GlobeCard = () => {
  const globeRef = useRef();
  const [safetyData, setSafetyData] = useState({});

  useEffect(() => {
    const fetchAllAdvisories = async () => {
      try {
        const worldData = await d3.json("world.json");
        const countryCodes = worldData.features.map((d) => d.id);

        const advisoryPromises = countryCodes.map(async (code) => {
          const data = await fetchAdvisory(code);
          return { code, data };
        });

        const results = await Promise.all(advisoryPromises);

        const advisoryMap = {};
        const missing = [];

        results.forEach(({ code, data }) => {
          if (data) {
            advisoryMap[code] = data;
          } else {
            missing.push(code);
          }
        });

        if (missing.length > 0) {
          console.warn("Missing country codes:", missing);
        }

        setSafetyData(advisoryMap);
      } catch (error) {
        console.error("Error fetching all advisories:", error);
      }
    };

    fetchAllAdvisories();
  }, []);

  useEffect(() => {
    if (globeRef.current && Object.keys(safetyData).length > 0) {
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

      svg.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "#abcadb") 
      .attr("stroke", "none"); 

      svg.append("path")
      .datum(graticule)
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#abcadb");

      d3.json("world.json").then((worldData) => {
        const countries = worldData.features;

        svg.selectAll(".country")
          .data(countries)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", path)
          .attr("fill", (d) => {
            const advisory = safetyData[d.id];
            return advisory
            ? advisory.advice === "No advisory"
            ? "#4d4c60"
            : advisory.advice === "Advisory against travel to certain areas"
            ? "#674f82"
            : advisory.advice === "Advisory against non-essential travel"
            ? "#c07182"
            : advisory.advice === "Advisory against all travel"
            ? "#e69c67"
            : "#e8e8e8"
            : "#e8e8e8";})

          .attr("stroke", "#222")
          .on("mouseenter", (event, d) => {
            const advisory = safetyData[d.id];
            const tooltip = d3.select("#tooltip");
            if (advisory) {
              tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`)
                .style("display", "inline-block")
                .html(`<strong>${advisory.country_name}</strong><br>${advisory.advice}`);
            } else {
              tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`)
                .style("display", "inline-block")
                .html(`<strong>Unknown Country</strong><br>No Data`);
            }
          })
          .on("mouseleave", () => {
            d3.select("#tooltip").style("display", "none");
          });
      });

      const dragBehavior = drag().on("drag", (event) => {
        const rotate = projection.rotate();
        projection.rotate([rotate[0] + event.dx * 0.3, rotate[1] - event.dy * 0.3]);
        svg.selectAll("path").attr("d", path);
      });

      svg.call(dragBehavior);

      const zoomBehavior = d3.zoom().on("zoom", (event) => {
        const newScale = Math.max(100, Math.min(width / 2, event.transform.k * (width / 3)));
        projection.scale(newScale);
        svg.selectAll("path").attr("d", path);
      });

      svg.call(zoomBehavior);
    }
  }, [safetyData]);

  if (Object.keys(safetyData).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <CustomCard>
      <div ref={globeRef} style={{ width: "100%", minHeight: "400px", height: "100%" }} />
      <div
        id="tooltip"
        style={{
          position: "absolute",
          display: "none",
          backgroundColor: "#fff",
          color: "black",
          padding: "5px",
          borderRadius: "5px",
          pointerEvents: "none",
        }}
      />
    </CustomCard>
  );
};

export default GlobeCard;

