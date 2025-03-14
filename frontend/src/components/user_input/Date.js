import * as React from 'react';
import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import dayjs from 'dayjs'; 

const CustomDatePicker = ({label, onChange}) => {
  const [selectedDate, setSelectedDate] = React.useState(null);

  const handleDateChange = (newDate) => {
    if (newDate) {
      const formattedDate = dayjs(newDate).format("YYYY-MM-DD"); 
      setSelectedDate(newDate);
      if (onChange) {
        onChange(formattedDate); 
      }
    }
  };

  const startDate = dayjs("2025-03-11");
  const endDate = dayjs("2025-03-31");

  const shouldDisableDate = (date) => date.isBefore(startDate) || date.isAfter(endDate);


  return (
    <Box sx={{flexDirection: "column", display: "flex"}}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
          label={`${label} *`}
          value={selectedDate}
          onChange={handleDateChange}
          shouldDisableDate={shouldDisableDate}
          minDate={startDate} 
          maxDate={endDate} 
          views={["year", "month", "day"]} 
          openTo="day"
          disableFuture={false}
          renderInput={(params) => <TextField {...params} required />}
        />
      </LocalizationProvider>
    </Box>
  );
}

export default CustomDatePicker;
