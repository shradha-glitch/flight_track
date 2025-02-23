import { Box, Container } from "@mui/material";
import CustomCard from "./card/Card"; 
import GlobeCard from "./card/GlobeCard"; 
import SearchCard from "./card/SearchCard"; 

const Dashboard = () => {
  const handleCity = (city) => {
    console.log("City selected:", city);
  };

  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 4, px: 0 }}>
      <Box
        sx={{
          display: "grid",
          gap: { xs: 2, md: 4 }, 
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, 
        }}>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <SearchCard onSelect={handleCity} />
        </Box>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <CustomCard title="Middle Card containing parallel coordinates" />
        </Box>
        <GlobeCard />
        <CustomCard title="Bottom Card 2" />
        <CustomCard title="Bottom Card 3" />
      </Box>
    </Container>
  );
};
export default Dashboard;
