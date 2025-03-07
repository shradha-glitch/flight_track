import { Box, Container } from "@mui/material";
import CustomCard from "./card/Card"; 
import GlobeCard from "./card/GlobeCard"; 
import PcpCard from "./card/PcpCard";
import { useState } from 'react';
import ResultsCard from "./ResultsCard";

const Dashboard = () => {
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  const handleCity = (city) => {
    console.log("City selected:", city);
  };

  const handleFilterChange = (destinations) => {
    setFilteredDestinations(destinations);
  };

  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 4, px: 0 }}>
      <Box
        sx={{
          display: "grid",
          gap: { xs: 2, md: 2 }, 
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, 
        }}
      >
        <Box sx={{ gridColumn: "1 / -1" }}>
          <PcpCard onSelect={handleCity} onFilterChange={handleFilterChange} />
        </Box>
        
        <GlobeCard
          destinations={filteredDestinations}
        />
        <ResultsCard destinations={filteredDestinations} />
        <CustomCard />
      </Box>
    </Container>
  );
};

export default Dashboard;
