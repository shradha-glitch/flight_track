import React, { useState, useEffect } from "react";
import {
  TextField,
  Autocomplete,
  Box,
  Chip,
  Typography,
  Avatar,
} from "@mui/material";

const PassportInput = () => {
  const [search, setSearch] = useState("");
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

  useEffect(() => {
    fetch("/world.json")
      .then((response) => response.json())
      .then((data) => {
        const countryData = data.features.map((country) => ({
          label: country.properties.name,
          iso2: country.id.toLowerCase(),
          callingCode: country.properties.callingCode || "",
        }));
        setCountries(countryData);
      })
      .catch((error) => console.error("Error fetching country data:", error));
  }, []);

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
        onChange={(e, newValue) => setSelectedCountries(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Passport"
            variant="outlined"
            onChange={(e) => setSearch(e.target.value)}
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
          const firstCountry = value[0]; 
          const additionalCount = value.length > 1 ? ` +${value.length - 1}` : ""; 
          return (
            <Chip
              {...getTagProps({ index: 0 })} // Use the first tag's props
              label={`${firstCountry.label}${additionalCount}`}
              avatar={
                <Avatar
                  src={`https://countryflagsapi.netlify.app/flag/${firstCountry.iso2}.svg`}
                  alt={firstCountry.label}
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
          );
        }}
      />
    </Box>
  );
};

export default PassportInput;
