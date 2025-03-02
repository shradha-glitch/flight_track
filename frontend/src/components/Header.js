import * as React from "react";
import { Box, Container } from "@mui/material";
import Logo from "./logo";

export default function Header() {
  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 2, px: 0 }}>
      <Box>
      <Logo fillcolor="#1B1B1B"></Logo>
    </Box> 
    
    </Container>     
  );
}
