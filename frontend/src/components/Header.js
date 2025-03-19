import * as React from "react";
import { Box, Container, Button, Dialog, DialogContent } from "@mui/material";
import Logo from "./logo";
import About from "./About";

export default function Header() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
    <Container maxWidth="100%" sx={{ mt: 4, mb: 2, px: 0 }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Box sx={{ cursor: 'pointer' }}>
        <Logo fillcolor="#1B1B1B"></Logo>
      </Box> 
      <Button
        onClick={handleOpen}
        sx={{
          mt: 2,
          color: '#1B1B1B',
          '&:hover': {
            backgroundColor: 'rgba(27, 27, 27, 0.04)'
          }
        }}
      >
        About
      </Button>
    </Box>
    </Container> 

    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      >
      <DialogContent>
        <About />
      </DialogContent>    
    </Dialog>
  </>
  );
}
