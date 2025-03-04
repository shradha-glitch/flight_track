import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { drag } from "d3-drag";
import CustomCard from "./card/Card";

const GlobeResultsCard = ({ destinations = [] }) => {
  const globeRef = useRef();

  useEffect(() => {
    if (!globeRef.current) return;

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

    const svg = container
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

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

    const filteredCountries = new Set(
      destinations.map(d => d.destination_info.country_name)
    );

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
          const isHighlighted = filteredCountries.has(d.properties.name);
          const tooltip = d3.select("#globe-results-tooltip");
          
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`)
            .style("display", "inline-block")
            .html(`<strong>${d.properties.name}</strong><br>${isHighlighted ? "Selected" : "Not Selected"}`);
        })
        .on("mouseleave", () => {
          d3.select("#globe-results-tooltip").style("display", "none");
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
      const newScale = Math.max(100, Math.min(width / 2, event.transform.k * (width / 3)));
      projection.scale(newScale);
      svg.selectAll("path").attr("d", path);
    });

    svg.call(zoomBehavior);

  }, [destinations]);

  return (
    <CustomCard>
      <div ref={globeRef} style={{ width: "100%", minHeight: "400px", height: "100%" }} />
      <div
        id="globe-results-tooltip"
        style={{
          position: "absolute",
          display: "none",
          backgroundColor: "#fff",
          color: "black",
          padding: "5px",
          borderRadius: "5px",
          pointerEvents: "none",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}
      />
    </CustomCard>
  );
};

export default GlobeResultsCard;