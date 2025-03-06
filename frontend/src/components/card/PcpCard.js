import CustomCard from "./Card";
import ParallelCoordinates from "../PCP";
import { Box, Button } from "@mui/material";
import Departure from "../user_input/Location";
import PassportInput from "../user_input/Passport";
import DatePicker from "../user_input/Date";
import Header from "../Header";
import SearchIcon from "@mui/icons-material/Search";
import React, { useState, useEffect } from "react";

const PcpCard = ({ onSelect, onFilterChange }) => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [passportIsoCode, setPassportIsoCode] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const handlePassportChange = (selectedCountries) => {
    setPassportIsoCode(selectedCountries.map((country) => country.iso2));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault(); 
    const form = e.target;

  console.log(form.checkValidity());
  console.log(setSearchTriggered)

  if (form.checkValidity()) {
    setIsFormValid(true);
    setSearchTriggered(false);
    setTimeout(() => setSearchTriggered(true), 0);
  } else {
    setIsFormValid(false); 
  }
};

  // useEffect(() => {
  //   if (isFormValid) {
  //     // Reset isFormValid after rendering ParallelCoordinates
  //     setTimeout(() => setIsFormValid(false), 0);
  //   }
  // }, [isFormValid]);

  return (
    <CustomCard>
      <Header></Header>
      <form onSubmit={handleSubmit}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          px: 4,
          flexWrap: "wrap"
        }}
      >
        <Departure onSelect={onSelect} required/>
        <DatePicker label={"Departure"} text={"Dates of Travel"} required />
        <DatePicker label={"Return"} text={" fef"} required/>
        <PassportInput onChange={handlePassportChange}/>
        <Button
          type="submit" 
          variant="contained"
          startIcon={<SearchIcon />}
          sx={{
            py:2,
            px:4,
            maxHeight:55,
            maxWidth:200,
            fontSize: 16,
            textTransform: "none",
            backgroundColor: "#F1C120",
            color: "#000",
            "&:hover": {
              backgroundColor: "#D8AD1C",
            },
          }}
        >
          Search
        </Button>
      </Box>
      </form>
      <Box sx={{ px: 4 }}>
      <hr style={{ border: 'none', borderTop: '1px solid #D3D3D3' }} /> 
      {searchTriggered && (
        <ParallelCoordinates onFilterChange={onFilterChange} passportIsoCode={passportIsoCode}/>
      )}
      </Box>
    </CustomCard>
  );
};

export default PcpCard;
