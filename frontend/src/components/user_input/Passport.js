import React, { useState, useEffect } from "react";
import {
  TextField,
  Autocomplete,
  Box,
  Chip,
  Typography,
  Avatar,
} from "@mui/material";

const PassportInput = ({ onChange, value }) => {
  const [search, setSearch] = useState("");
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(value || []);
  const [error, setError] = useState(false); // To manage the error state

  useEffect(() => {
    fetch("/world.json")
      .then((response) => response.json())
      .then((data) => {
        const countryData = data.features.map((country) => ({
          label: country.properties.name,
          iso2: country.id.toLowerCase(), // Ensure iso2 is correctly set
          callingCode: country.properties.callingCode || "",
        }));
        setCountries(countryData);
      })
      .catch((error) => console.error("Error fetching country data:", error));
  }, []);

  const handleChange = (newValue) => {
    setSelectedCountries(newValue);
    setError(newValue.length === 0); // Show error if no countries are selected
    onChange?.(newValue); // Send the selected countries to the parent
  };

  // Check for undefined or empty country objects
  const isValidCountry = (country) => country && country.iso2 && country.label;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: "150px",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <Autocomplete
        multiple
        freeSolo
        options={countries}
        value={selectedCountries}
        getOptionLabel={(option) => option.label || ""}
        onChange={(e, newValue) => handleChange(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Passport"
            variant="outlined"
            // Removed `required` here
            onChange={(e) => setSearch(e.target.value)}
            error={error}
            helperText={error ? "This field is required" : ""}
            InputProps={{
              ...params.InputProps,
              sx: {
                flexWrap: 'nowrap',
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#bdbdbd',
                  borderRadius: '4px',
                },
              }
            }}
          />
        )}
        renderOption={(props, option) => (
          <li
            {...props}
            key={option.iso2}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Avatar
              src={`https://countryflagsapi.netlify.app/flag/${option.iso2}.svg`}
              alt={option.label}
              sx={{ width: 18, height: 18 }}
            />
            <Typography>{option.label}</Typography>
          </li>
        )}
        inputValue={search}
        onInputChange={(e, newValue) => setSearch(newValue)}
        renderTags={(value, getTagProps) => {
          if (value.length === 0) return null;

          return value
            .filter(isValidCountry) // Ensure only valid countries are rendered
            .map((country, index) => (
              <Chip
                {...getTagProps({ index })}
                key={index}
                label={country.label}
                avatar={
                  <Avatar
                    src={`https://countryflagsapi.netlify.app/flag/${country.iso2}.svg`}
                    alt={country.label}
                  />
                }
                sx={{
                  margin: "4px",
                  backgroundColor: "#E5E5E5",
                  color: "#000",
                  borderRadius: "5px",
                  "& .MuiChip-label": {
                    fontSize: "14px",
                  },
                }}
              />
            ));
        }}
      />
    </Box>
  );
};

export default PassportInput;
