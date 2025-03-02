import React, { useState, useEffect } from 'react';
import { TextField, Autocomplete, Box, Chip } from '@mui/material';

const PassportSearchInput = () => {
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

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
    <Box sx={{ flex: 1, minWidth: "150px",flexDirection: "column", display: "flex" }}>
      <Autocomplete
        multiple
        freeSolo
        options={countries}
        value={selectedCountries}
        getOptionLabel={(option) => option.label || ''}
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
          <li {...props} key={option.iso2}>
            {option.label}
          </li>
        )}
        inputValue={search}
        onInputChange={(e, newValue) => setSearch(newValue)}
        renderTags={(value, getTagProps) => 
          value.map((option, index) => (
            <Chip 
              key={index} 
              label={option.label} 
              {...getTagProps({ index })} 
              sx={{
                margin: '4px',
                backgroundColor: '#E5E5E5',
                color: '#000',
                borderRadius: '5px',
                '& .MuiChip-label': {
                  fontSize: '14px',
                },
              }}
            />
          ))
        }
      />
    </Box>
  );
};

export default PassportSearchInput;
