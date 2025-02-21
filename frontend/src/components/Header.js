import * as React from "react";
import { Box, Container,Typography } from "@mui/material";

export default function Header() {
  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 4, px: 0 }}>
      <Box>
      <Typography variant="h2">{"Journey"}</Typography>
    </Box> 
    
    </Container>     
  );
}
