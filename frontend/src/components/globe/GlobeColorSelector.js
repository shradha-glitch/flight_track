"use client"

import React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export function GlobeColorSelector({ onChange }) {
  const [alignment, setAlignment] = React.useState("advisory");

  const handleChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      if (onChange) {
        onChange(newAlignment);
      }
    }
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChange}
      aria-label="Color scheme"
      size="small"
      sx={{ 
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 1,
        "& .MuiToggleButton-root": {
          color: "white",
          border: "none",
          padding: "4px 12px",
          fontSize: "0.85rem",
        },
        "& .MuiToggleButton-root:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
        "& .Mui-selected": {
          backgroundColor: "#D8AD1D !important",
          color: "black !important",
        },
        "& .Mui-selected:hover": {
          backgroundColor: "white !important",
        }
      }}
    >
      <ToggleButton value="advisory">Advisory</ToggleButton>
      <ToggleButton value="visa">Visa</ToggleButton>
    </ToggleButtonGroup>
  );
}