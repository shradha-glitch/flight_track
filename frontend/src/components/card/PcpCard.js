import CustomCard from "./Card";
import ParallelCoordinates from "../PCP";
import { Box, Button } from "@mui/material";
import Departure from "../user_input/Location";
import PassportInput from "../user_input/Passport";
import DatePicker from "../user_input/Date";
import Header from "../Header";
import SearchIcon from "@mui/icons-material/Search";

const PcpCard = ({ onSelect }) => {
  return (
    <CustomCard>
      <Header></Header>
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
        <Departure onSelect={onSelect} />
        <DatePicker label={"Departure"} text={"Dates of Travel"} />
        <DatePicker label={"Return"} text={" fef"}/>
        <PassportInput />
        <Button
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
      <Box sx={{ px: 4 }}>
        <ParallelCoordinates />
      </Box>
    </CustomCard>
  );
};

export default PcpCard;
