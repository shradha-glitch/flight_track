import React, { useState } from "react";
import { TextField, Autocomplete, Box } from "@mui/material";

const location_options = [
  "Stockholm, Sweden",
  "Berlin, Germany",
  "Tokyo, Japan",
  "New York, USA",
  "Paris, France",
  "London, UK",
  "Sydney, Australia",
  "Cairo, Egypt",
  "Beijing, China",
  "São Paulo, Brazil"
];

const DeparturePicker = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState(""); 
  const [selectedCity, setSelectedCity] = useState(null);

  return (
    <Box sx={{ flex: 1, minWidth: "150px",flexDirection: "column", display: "flex" }}>
      <Autocomplete
        options={location_options} 
        freeSolo 
        inputValue={inputValue} 
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        value={selectedCity} 
        onChange={(event, newCity) => {
          if (newCity) {
            setSelectedCity(newCity);
            onSelect(newCity); 
          }
        }}
        renderInput={(params) => <TextField {...params} required label="Departure Location" />}
      />
    </Box>
  );
};

export default DeparturePicker;
