import React, { useState, useEffect } from 'react';
import { TextField, Autocomplete, Box } from '@mui/material';

const PassportSearchInput = () => {
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetch('/world.json')
      .then((response) => response.json())
      .then((data) => {
        const countryData = data.features.map((country) => ({
          label: country.properties.name,
          iso2: country.id,
        }));
        setCountries(countryData);
      })
      .catch((error) => console.error('Error fetching country data:', error));
  }, []);

  return (
    <Box sx={{ flex: 1, minWidth: "200px" }}>
      <Autocomplete
        freeSolo
        options={countries}
        getOptionLabel={(option) => option.label || ''}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Passport"
            variant="outlined"
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.iso2}>
            {option.label}
          </li>
        )}
        inputValue={search}
        onInputChange={(e, newValue) => setSearch(newValue)}
      />
    </Box>
  );
};

export default PassportSearchInput;
