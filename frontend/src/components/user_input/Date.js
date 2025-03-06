import * as React from 'react';
import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import dayjs from 'dayjs'; // Import Day.js for formatting

const CustomDatePicker = ({label, onChange}) => {
  const [selectedDate, setSelectedDate] = React.useState(null);

  const handleDateChange = (newDate) => {
    if (newDate) {
      const formattedDate = dayjs(newDate).format("YYYY-MM-DD"); // Format to dd-mm-yyyy
      setSelectedDate(newDate);
      if (onChange) {
        onChange(formattedDate); // Pass formatted date to parent
      }
    }
  };

  return (
    <Box sx={{flexDirection: "column", display: "flex"}}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
          label={`${label} *`}
          value={selectedDate}
          onChange={handleDateChange}
          renderInput={(params) => <TextField {...params} required />}
        />
      </LocalizationProvider>
    </Box>
  );
}

export default CustomDatePicker;
