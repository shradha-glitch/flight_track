import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { drag } from "d3-drag";
import CustomCard from "./Card";

const Globe = () => { 
  const globeRef = useRef();

  useEffect(() => {
    const container = d3.select(globeRef.current);
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
      .attr("fill", "#1a1a1a") 
      .attr("stroke", "#fff");

    svg.append("path")
      .datum(graticule)
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#555");

    d3.json("world.json").then((worldData) => {
      const countries = worldData.features;
      svg.selectAll(".country")
        .data(countries)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", "#4CAF50")
        .attr("stroke", "#222");
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

  }, );

  return (
    <CustomCard title="Globe" sx={{ minHeight: 400 }}>
      <div ref={globeRef} style={{ width: "100%", height: "100%" }}></div>
    </CustomCard>
  );
};

export default Globe;
