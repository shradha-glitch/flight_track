import CustomCard from "./Card";
import ParallelCoordinates from "../PCP";
import { Box } from "@mui/material";
import Departure from "../user_input/Location";
import PassportInput from "../user_input/Passport";
import DatePicker from "../user_input/Date";
import Header from "../Header";

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
        }}
      >
        <Departure onSelect={onSelect} />
        <DatePicker label={"Departure"} />
        <DatePicker label={"Return"} />
        <PassportInput />
      </Box>
      <Box
      sx={{px: 4}}>
      <ParallelCoordinates/> 
      </Box>
    </CustomCard>
  );
};

export default PcpCard;
