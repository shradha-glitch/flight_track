import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { drag } from "d3-drag";

const Globe = ({ type, data = [] }) => {
  const globeRef = useRef();
  const [worldData, setWorldData] = useState(null);

  useEffect(() => {
    d3.json("/world.json").then((json) => setWorldData(json.features));
  }, []);

  useEffect(() => {
    if (globeRef.current && Object.keys(data).length > 0) {
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
  
      const filteredCountries = new Set(data.map(d => d.destination_info.country_name));
  
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
            if (type === "advisory") {
              const advisoryCountry = data[d.id];
              return advisoryCountry
                ? advisoryCountry.advice === "No advisory"
                  ? "#4d4c60"
                  : advisoryCountry.advice === "Advisory against travel to certain areas"
                  ? "#674f82"
                  : advisoryCountry.advice === "Advisory against non-essential travel"
                  ? "#c07182"
                  : advisoryCountry.advice === "Advisory against all travel"
                  ? "#e69c67"
                  : "#e8e8e8"
                : "#e8e8e8";
            }
            if (type === "results") {
              const isHighlighted = filteredCountries.has(d.properties.name);
              return isHighlighted ? "#4CAF50" : "#4d4c60";
            }
          })
          .attr("stroke", "#222");
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
  }, [data, type]);
  if (!worldData) return <div>Loading...</div>;

  return (
    <>
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
    </>
  );
};

export default Globe;
