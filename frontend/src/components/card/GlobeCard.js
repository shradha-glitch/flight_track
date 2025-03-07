import React, { useState, useEffect } from "react";
import AdvisoryGlobe from "../globe/GlobeAdvisory";
import CustomCard from "./Card";
import { Box, Button } from "@mui/material";
import GlobeResultsCard from "../globe/GlobeResults";

const GlobeCard = ({ destinations = [], advisory = [] }) => {
  const [activeTab, setActiveTab] = useState("advisory");
  
  // Track prop changes
  useEffect(() => {
    console.log('Destinations updated:', destinations);
  }, [destinations]);  // This will log every time 'destinations' prop changes
  
  return (
    <CustomCard>
      <Box
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          width: "80%", 
          height: "50px",
          margin: "10px auto",
          backgroundColor: "#F3F3F5",
          borderRadius: "8px",
          overflow: "hidden", 
        }}
      >
        {["Results", "Advisory", "Visa"].map((key) => (
          <Button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              width: "30%",
              height: "80%", 
              cursor: "pointer",
              backgroundColor: activeTab === key ? "#F1C120" : "#F3F3F5",
              "&:hover": {
                backgroundColor: "#D8AD1C",
              },
              textTransform: "none",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px", 
            }}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        ))}
      </Box>
      {activeTab === "Results" ? (
        <GlobeResultsCard data={destinations} />
      ) : (
        <AdvisoryGlobe />
      )}
    </CustomCard>
  );
};

export default GlobeCard;
