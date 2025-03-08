import React, { useState } from "react";
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem, 
  Typography,
  ListItemIcon
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';

// Updated to only have 3 options (no Results option)
const colorSchemes = [
  {
    value: "advisory",
    label: "Travel Advisory",
  },
  {
    value: "visa",
    label: "Visa Requirements",
  },
  {
    value: "temperature",
    label: "Temperature",
  },
];

export function GlobeColorSelector({ onChange }) {
  const [value, setValue] = useState("advisory"); // Default to advisory instead of results
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleSelect = (currentValue) => {
    setValue(currentValue);
    handleClose();
    if (onChange) {
      onChange(currentValue);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ 
          backgroundColor: 'white', 
          color: 'black',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
          width: '280px',
          justifyContent: 'space-between',
          textTransform: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography color="text.secondary" sx={{ mr: 1 }}>
            Colour:
          </Typography>
          <Typography>
            {colorSchemes.find((scheme) => scheme.value === value)?.label}
          </Typography>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: '280px', maxWidth: '100%' }
        }}
      >
        {colorSchemes.map((scheme) => (
          <MenuItem 
            key={scheme.value}
            onClick={() => handleSelect(scheme.value)}
            sx={{ 
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            {scheme.label}
            {value === scheme.value && (
              <ListItemIcon sx={{ minWidth: 'auto' }}>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}