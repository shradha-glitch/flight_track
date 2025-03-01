import React from "react";
import { Box } from "@mui/material";
import Departure from "../user_input/Location";
import PassportInput from "../user_input/Passport";
import DatePicker from "../user_input/Date";

const SearchCard = ({ onSelect }) => {
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
      <Departure onSelect={onSelect} />
      <DatePicker label={"Departure"} />
      <DatePicker label={"Return"} />
      <PassportInput />
    </Box>
  );
};

export default SearchCard;
