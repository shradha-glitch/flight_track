import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { drag } from "d3-drag";

const FetchVisa = async (countryCode) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8001/api/visa?country_codes=${countryCode}`
    );
    if (!response.ok) throw new Error("Network response did not work");
    const result = await response.json();
    return result;
  } catch (error) {
    return null;
  }
};

const GlobeVisa = ({ countryCodes = [] }) => {
  console.log("countries:", countryCodes); // Logging for debugging

  const globeRef = useRef();
  const [visaData, setVisaData] = useState({});
  const [countryNames, setCountryNames] = useState({});

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

  const mapCountryCodesToNames = (worldData) => {
    const countryMap = {};
    worldData.features.forEach((feature) => {
      countryMap[feature.id] = feature.properties.name;
    });
    setCountryNames(countryMap);
  };

  const getWorstVisaRequirement = (countryId) => {
    let worstRequirement = "unknown";

    for (let passportCode in visaData) {
      const requirements = visaData[passportCode];
      if (requirements && requirements[countryId]) {
        const requirement = requirements[countryId];
        if (requirement && visaPriority[requirement] > visaPriority[worstRequirement]) {
          worstRequirement = requirement;
        }
      }
    }
  
    return worstRequirement;
  };  

  useEffect(() => {
    const fetchVisaForMultiplePassports = async () => {
      if (Array.isArray(countryCodes) && countryCodes.length > 0) {
        const allVisaData = {};

        for (let countryCode of countryCodes) {
          const data = await FetchVisa(countryCode);
          if (data) {
            allVisaData[countryCode] = data.requirements[countryCode];
          }
        }
        setVisaData(allVisaData);
      }
    };

    if (countryCodes && countryCodes.length > 0) {
      fetchVisaForMultiplePassports();
    }

    d3.json("world.json").then((worldData) => {
      mapCountryCodesToNames(worldData);
    });
  }, [countryCodes]); 

  useEffect(() => {
    if (globeRef.current && visaData) {
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

      svg
        .append("path")
        .datum({ type: "Sphere" })
        .attr("d", path)
        .attr("fill", "#abcadb")
        .attr("stroke", "none");

      svg
        .append("path")
        .datum(graticule)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#abcadb");

      d3.json("world.json").then((worldData) => {
        const countries = worldData.features;

        svg
          .selectAll(".country")
          .data(countries)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", path)
          .attr("fill", (d) => {
            const worstVisa = getWorstVisaRequirement(d.id);

            switch (worstVisa) {
              case "visa free":
                return "#4CAF50";
              case "visa required":
                return "#C70039";
              case "e-visa":
                return "#FF5733";
              case "visa on arrival":
                return "#fef018";
              case "eta":
                return "#DAF7A6";
              default:
                return "#4d4c60";
            }
          })
          .attr("stroke", "#222")
          .on("mouseenter", (event, d) => {
            const visaText = Object.entries(visaData).map(([passport, requirements]) => {
              let visaRequirement = requirements[d.id] || "No Data";
              if (typeof visaRequirement === "number" && visaRequirement > 0) {
                visaRequirement = `${visaRequirement} days of Visa Free travel`;
              }
              if (typeof visaRequirement === "number" && visaRequirement < 0) {
                visaRequirement = "home country";
              }
              const countryName = countryNames[passport] || passport;
              return `${countryName}: ${visaRequirement}`;
            }).join("<br>");

            const tooltip = d3.select("#tooltip");
            tooltip
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`)
              .style("display", "inline-block")
              .html(`
                <strong>${d.properties.name}</strong><br>
                ${visaText}
              `);
          })
          .on("mouseleave", () => {
            d3.select("#tooltip").style("display", "none");
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
        const newScale = Math.max(
          100,
          Math.min(width / 2, event.transform.k * (width / 3))
        );
        projection.scale(newScale);
        svg.selectAll("path").attr("d", path);
      });

      svg.call(zoomBehavior);
    }
  }, [visaData, countryNames]);

  return (
    <>
      <div
        ref={globeRef}
        style={{ width: "100%", minHeight: "400px", height: "100%" }}
      />
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

export default GlobeVisa;
