import * as React from 'react';
import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';

const CustomDatePicker = ({label, text}) => {
  return (
    <Box sx={{flexDirection: "column", display: "flex"}}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
          label={`${label} *`}
          renderInput={(params) => <TextField {...params} required />}
        />
      </LocalizationProvider>
    </Box>
  );
}

export default CustomDatePicker;
