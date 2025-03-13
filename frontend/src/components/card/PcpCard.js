import CustomCard from "./Card";
import ParallelCoordinates from "../PCP";
import { Box, Button, Typography } from "@mui/material";
import Departure from "../user_input/Location";
import PassportInput from "../user_input/Passport";
import DatePicker from "../user_input/Date";
import Header from "../Header";
import SearchIcon from "@mui/icons-material/Search";
import React, { useState, useEffect } from "react";
import Logo from "../logo";  // Add this import

const PcpCard = ({ onSelect, onFilterChange, onPassportChange }) => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [passportIsoCode, setPassportIsoCode] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [departureDateError, setDepartureDateError] = useState(null);
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [showPassportWarning, setShowPassportWarning] = useState(false);

  const handlePassportChange = (selectedPassports) => {
    setPassportIsoCode(selectedPassports.map((country) => country.iso2));
    setShowPassportWarning(selectedPassports.length === 0); 
    onPassportChange(selectedPassports); 
  };

  const handleDepartureDate = (date, error) => {
    setDepartureDate(date);
    setDepartureDateError(error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    if (!departureDate) {
      setIsFormValid(false);
      setDepartureDateError('invalidDate');
      setShowDateWarning(true);
      return;
    }

    if (!passportIsoCode || passportIsoCode.length === 0) {
      setIsFormValid(false);
      setShowPassportWarning(true);
      return;
    }

    if (form.checkValidity() && !departureDateError) {
      setIsFormValid(true);
      setShowDateWarning(false);
      setShowPassportWarning(false);
      setSearchTriggered(false);
      setTimeout(() => setSearchTriggered(true), 0);
    } else {
      setIsFormValid(false);
    }
  };

  return (
    <CustomCard>
      <Header />
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            mb: 4,
            mt: 5,
            display: "flex",
            flexDirection: "row",
            justifyContent: { xs: "space-between", lg: "space-evenly" },
            alignItems: "flex-start",
            gap: { xs: 1, sm: 2 },
            px: { xs: 2, sm: 4 }, 
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ width: { xs: "100%", sm: "45%", md: "30%", lg: "250px" }, minWidth: "200px" }}>
            <Departure onSelect={onSelect} required />
          </Box>
          <Box sx={{ width: { xs: "100%", sm: "45%", md: "30%", lg: "250px" }, minWidth: "200px" }}>
            <DatePicker onChange={handleDepartureDate} label={"Departure"} text={"Dates of Travel"} required />
            {showDateWarning && !departureDate && (
              <Box sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5, ml: 2, fontFamily: "Helvetica" }}>
                Please select a departure date
              </Box>
            )}
          </Box>
          <Box sx={{ width: { xs: "100%", sm: "45%", md: "30%", lg: "450px" }, minWidth: "200px" }}>
            <PassportInput onChange={handlePassportChange} />
            {showPassportWarning && (
              <Box sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5, ml: 2, fontFamily: "Helvetica" }}>
                Please select at least one passport country
              </Box>
            )}
          </Box>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{
              py: { xs: 1.5, sm: 2 },
              px: { xs: 3, sm: 4 },
              height: { xs: "48px", sm: "56px" },
              width: { xs: "100%", sm: "200px" },
              minWidth: "150px",
              fontSize: { xs: 14, sm: 16 },
              textTransform: "none",
              backgroundColor: "#F1C120",
              color: "#000",
              "&:hover": {
                backgroundColor: "#D8AD1C",
              },
              mt: { xs: 1, sm: 0 }, 
            }}
          >
            Search
          </Button>
        </Box>
      </form>
      <Box sx={{ px: 4 }}>
        <hr style={{ border: "none", borderTop: "1px solid #D3D3D3" }} />
        {searchTriggered ? (
          <ParallelCoordinates 
          onFilterChange={onFilterChange} 
          passportIsoCode={passportIsoCode} 
          departureDate={departureDate} />
        ) : (
          <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            textAlign: 'center',
            color: '#666',
          }}
          >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'medium' }}>
            Welcome to
          </Typography>
            <Box sx={{ mb: 3 }}>
              <Logo fillColor="#1B1B1B" />
            </Box>
            <Typography variant="body1" sx={{ maxWidth: 600, mb: 1 }}>
              To explore available flights, please provide:
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 600, mb: 3 }}>
            • Departure location
            • Departure date
            • Passport information
          </Typography>
          <Typography variant="body2" sx={{ color: '#888' }}>
            Once you've entered the required information, click "Search" to view flight options and filter based on your preferences.
          </Typography>
          </Box> 
        )
        }
      </Box>
    </CustomCard>
  );
};

export default PcpCard;
