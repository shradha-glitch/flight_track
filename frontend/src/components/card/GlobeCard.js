import React, { useState, useEffect } from "react";
import AdvisoryGlobe from "../globe/GlobeAdvisory";
import CustomCard from "./Card";
import { Box, Button } from "@mui/material";
import GlobeGL from "../globe/GlobeGL";

const GlobeCard = ({ destinations = [], countries = [] }) => {
  const [activeTab, setActiveTab] = useState("Advisory");
  const formattedCountries = countries.map((country) => country.toUpperCase());

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
      </Box>

      {/* Replace the conditional rendering with just GlobeGL */}
      <Box sx={{ height: "calc(100% - 70px)" }}>
        <GlobeGL data={destinations} />
      </Box>
    </CustomCard>
  );
};

export default GlobeCard;
