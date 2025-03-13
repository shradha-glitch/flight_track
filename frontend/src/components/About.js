import { Box, Typography, Container, Avatar } from "@mui/material";
import Grid from '@mui/material/Grid2';
import CustomCard from "./card/Card";

const About = () => {
    const team = [
        {
            name: "Amanda Arbinge",
            image: "/team/amanda.png",
            role: ["bleh bleh", "blah blah"]
        },
        {
            name: "Amina-Kamra Maglić",
            image: "/team/kamra.png",
            role: ["bleh bleh", "blah blah"]
        },
        {
            name: "Laieh Jwella",
            image: "/team/laieh.png",
            role: ["bleh bleh", "Blah blah"]
        },
        {
            name: "Kristín Hafsteinsdóttir",
            image: "/team/kristin.png",
            role: ["Frontend", "API Calls", "Data processing", "User testing"]
        },
        {
            name: "Shradha Retharekar",
            image: "/team/shradha.png",
            role: ["bleh bleh", "blah blah"]
        }
    ];
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <CustomCard sx={{ backgroundColor: '#CBC5B1'}}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            About Flight Track
          </Typography>
          <Typography variant="body1" paragraph>
            Flight Track is a comprehensive flight planning and visualization tool that helps travelers explore destinations worldwide. Our platform combines interactive globe visualization with real-time weather data and travel advisory information.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Features
          </Typography>
          <Typography variant="body1" paragraph>
            • Interactive 3D Globe Visualization
            • Real-time Weather Information
            • Travel Advisory Updates
            • Visa Requirement Details
            • Flight Route Planning
          </Typography>
          <Typography variant="body1" paragraph>
            Built with React and Three.js, Flight Track aims to make travel planning more intuitive and informative.
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Demo Video
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            The Team
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2, mb: 4 }}>
            {team.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.name}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <Avatar
                    src={member.image}
                    alt={member.name}
                    sx={{
                      width: 200,
                      height: 200,
                      mb: 2,
                      border: '3px solid #fff'
                    }}
                  />
                  <Typography variant="h6">
                    {member.name}
                  </Typography>
                  {member.role.map((roleItem, index) => (
                    <Typography 
                      key={index} 
                      variant="body2" 
                      sx={{ 
                        color: '#1B1B1B',
                        mb: 0.5,
                        fontSize: '0.9rem'
                      }}
                    >
                      {roleItem}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Data Abstraction and Provenance
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Task Abstraction
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            References
          </Typography>
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
        </Box>
      </CustomCard>
    </Container>
  );
};

export default About;