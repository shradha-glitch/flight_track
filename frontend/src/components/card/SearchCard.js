import React from "react";
import { Box } from "@mui/material";
import Departure from "../user_input/Location";
import PassportInput from "../user_input/Passport";
import DatePicker from "../user_input/Date";
import PassengerPicker from "../user_input/Passenger"

const SearchCard = ({ setSelectedCountry }) => {
  return (
    <Box
      title="Top Card containing search info"
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        gap: 2, 
      }}
    >
        <Departure onSelect={setSelectedCountry} />
        <DatePicker label={"Departure"}/>
        <DatePicker label={"Return"}/>
        <PassengerPicker></PassengerPicker>
        <PassportInput/>
     
    </Box>
  );
};

export default SearchCard;
