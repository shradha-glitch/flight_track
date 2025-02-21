import React from "react";
import { Box, Container } from "@mui/material";
import CustomCard from "./Card"; 

const CardGrid = () => {
  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 4, px: 0 }}>
      <Box
        sx={{
          display: "grid",
          gap: { xs: 2, md: 4 }, 
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, 
        }}
      >
        <Box sx={{ gridColumn: "1 / -1" }}> 
          <CustomCard title="Top Card containing search info" />
        </Box>
        <Box sx={{ gridColumn: "1 / -1" }}> 
          <CustomCard title="Middle Card containing parallel coordinates" />
        </Box>

        <CustomCard title="Bottom Card 1" />
        <CustomCard title="Bottom Card 2" />
        <CustomCard title="Bottom Card 3" />
      </Box>
    </Container>
  );
};

export default CardGrid;
