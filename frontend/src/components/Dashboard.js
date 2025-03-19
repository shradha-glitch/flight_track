import { Box, Container, Typography } from "@mui/material";
import PcpCard from "./card/PcpCard";
import { useState } from 'react';
import ResultsCard from "./ResultsCard";
import WeatherCard from "./card/WeatherCard";
import GlobeGL from "./globe/GlobeGL"; 
import CustomCard from "./card/Card"; 

const Dashboard = () => {
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [passportIsoCode, setPassportIsoCode] = useState([]); 

  const handleCity = (city) => {
    console.log("City selected:", city);
  };

  const handleFilterChange = (destinations) => {
    setFilteredDestinations(destinations);
    setSelectedDestination(null);
  };

  const handleSelectDestination = (destination) => {
    setSelectedDestination(destination);
  };

  const handlePassportChange = (selectedCountries) => {
    setPassportIsoCode(selectedCountries.map((country) => country.iso2));
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
          <PcpCard 
            onSelect={handleCity} 
            onFilterChange={handleFilterChange}
            onPassportChange={handlePassportChange} 
          />
        </Box>
        
        <CustomCard>
          <Box sx={{ height: "600px", width: "100%" }}>
            <GlobeGL 
            data={filteredDestinations} 
            selectedDestination={selectedDestination}
            onSelectedDestination={handleSelectDestination}
            />
          </Box>
        </CustomCard>
        
        <ResultsCard 
          destinations={filteredDestinations} 
          onSelectDestination={handleSelectDestination}
          selectedDestination={selectedDestination}
        />
        <WeatherCard selectedDestination={selectedDestination} />
      </Box>
      <Box sx={{ 
        mt: 4, 
        pt: 2, 
        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        textAlign: 'center' 
      }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Journey. Amanda Arbinge, Amina-Kamra Maglić, Laieh Jwella, Kristín Hafsteinsdóttir, Shradha Retharekar.
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;
