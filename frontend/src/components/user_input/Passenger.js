import React, { useState } from "react";
import { Select, MenuItem, FormControl, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const TravelerSelection = () => {
  const [numTravelers, setNumTravelers] = useState(1);

  const handleTravelerChange = (event) => {
    setNumTravelers(event.target.value);
  };

  return (
    <div style={{ maxWidth: "300px"}}>
      <FormControl fullWidth>
        <Select value={numTravelers} onChange={handleTravelerChange}>
          {[1, 2, 3, 4, 5].map((num) => (
            <MenuItem key={num} value={num}>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon fontSize="small" />
                {num}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TravelerSelection;
