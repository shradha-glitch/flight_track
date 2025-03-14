import { Box, Container } from "@mui/material";
import PcpCard from "./card/PcpCard";
import { useState } from 'react';
import ResultsCard from "./ResultsCard";
import WeatherCard from "./card/WeatherCard";
import GlobeGL from "./globe/GlobeGL"; // Import the new GlobeGL component
import CustomCard from "./card/Card"; // Import CustomCard

const Dashboard = () => {
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [passportIsoCode, setPassportIsoCode] = useState([]); // State to store passport codes

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

  // Pass the selected countries to the passportIsoCode state
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
            onPassportChange={handlePassportChange} // Pass the passport change handler to PcpCard
          />
        </Box>
        
        {/* Wrap GlobeGL in CustomCard as it was previously */}
        <CustomCard>
          <Box sx={{ height: "600px", width: "100%" }}>
            <GlobeGL data={filteredDestinations} />
          </Box>
        </CustomCard>
        
        <ResultsCard 
          destinations={filteredDestinations} 
          onSelectDestination={handleSelectDestination}
          selectedDestination={selectedDestination}
        />
        <WeatherCard selectedDestination={selectedDestination} />
      </Box>
    </Container>
  );
};

export default Dashboard;
