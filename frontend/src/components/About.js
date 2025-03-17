import { Box, Typography, Container, Avatar, Link, List } from "@mui/material";
import Grid from "@mui/material/Grid2";
import CustomCard from "./card/Card";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ListItem from "@mui/material/ListItem";
import ImageList from "@mui/material";

const About = () => {
  const team = [
    {
      name: "Amanda Arbinge",
      image: "/team/amanda.png",
      role: ["Front End", "API Calls", "Data Processing"],
    },
    {
      name: "Amina-Kamra Maglić",
      image: "/team/kamra.png",
      role: ["Visualisation design", "Front End", "User Testing"],
    },
    {
      name: "Laieh Jwella",
      image: "/team/laieh.png",
      role: ["Visualisation design", "Front End", "User Testing"],
    },
    {
      name: "Kristín Hafsteinsdóttir",
      image: "/team/kristin.png",
      role: ["Front End", "API Calls", "Data Processing", "User Testing"],
    },
    {
      name: "Shradha Retharekar",
      image: "/team/shradha.png",
      role: ["Backend", "Data Processing", "Hosting", "User Testing"],
    },
  ];
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <CustomCard sx={{ backgroundColor: "#CBC5B1" }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            About Flight Track
          </Typography>
          <Typography variant="body1" fontWeight="light"paragraph>
            Flight Track is a comprehensive flight planning and visualization
            tool that helps travelers explore destinations worldwide. Our
            platform combines interactive globe visualization with real-time
            weather data and travel advisory information.
          </Typography>
          <Link
            target="_blank"
            color="#000"
            variant="body2"
            fontWeight="light"
            href="https://github.com/shradha-glitch/flight_track"
            sx={{ textDecoration: "none" }}
          >
            Source code <OpenInNewIcon fontSize="10"></OpenInNewIcon>
          </Link>
          <Typography variant="h5" fontWeight="550"gutterBottom sx={{ mt: 3 }}>
            Features
          </Typography>
          <Typography variant="body1" fontWeight="light"paragraph>
            • Interactive 3D Globe Visualization • Real-time Weather Information
            • Travel Advisory Updates • Visa Requirement Details • Flight Route
            Planning
          </Typography>
          <Typography variant="body1" fontWeight="light"paragraph>
            Built with Python, React, Material UI and D3.js, Flight Track aims
            to make travel planning more intuitive and informative.
          </Typography>
          <Typography variant="h5" fontWeight="550"gutterBottom sx={{ mt: 3 }}>
            Demo Video
          </Typography>
          <Typography variant="h5" fontWeight="550"gutterBottom sx={{ mt: 3 }}>
            The Team
          </Typography >
          <Grid container spacing={4} sx={{ mt: 2, mb: 4 }} >
            {team.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.name}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    height: "100%",
                  }}
                >
                  <Avatar
                    src={member.image}
                    alt={member.name}
                    sx={{
                      width: 200,
                      height: 200,
                      mb: 2,
                      border: "3px solid #f8c424",
                    }}
                  />
                  <Typography variant="h6"fontWeight="550">{member.name}</Typography>
                  {member.role.map((roleItem, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      fontWeight="light"
                      sx={{
                        color: "#1B1B1B",
                        mb: 0.5,
                        fontSize: "0.9rem",
                      }}
                    >
                      {roleItem}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
          <Typography variant="h5" fontWeight="550"gutterBottom sx={{ mt: 3 }}>
            Data Abstraction and Provenance
          </Typography>
          <Box>
            <List>
              <ListItem>
                <Link
                  fontWeight="light"
                  target="_blank"
                  color="#000"
                  variant="body1"
                  href="https://drive.google.com/drive/folders/1EfyEaWFR_R5BLbl9Fp4jIZ_PYX_DP2J3?usp=sharing"
                  sx={{ textDecoration: "none" }}
                >
                  Google Drive Folder containing all Data{" "}
                  <OpenInNewIcon fontSize="10"></OpenInNewIcon>
                </Link>
              </ListItem>
              <ListItem>
                <Link
                fontWeight="light"
                  target="_blank"
                  color="#000"
                  variant="body1"
                  href="https://flagsapi.com/"
                  sx={{ textDecoration: "none" }}
                >
                  Flags API <OpenInNewIcon fontSize="10"></OpenInNewIcon>
                </Link>
              </ListItem>
              <ListItem>
                <Link
                fontWeight="light"  
                  target="_blank"
                  color="#000"
                  variant="body1"
                  href=" https://open-meteo.com/"
                  sx={{ textDecoration: "none" }}
                >
                  Weather forecast API
                  <OpenInNewIcon fontSize="10"></OpenInNewIcon>
                </Link>
              </ListItem>
              <ListItem>
                <Link
                fontWeight="light"  
                  target="_blank"
                  color="#000"
                  variant="body1"
                  href=" https://www.regeringen.se/ud-avrader/ "
                  sx={{ textDecoration: "none" }}
                >
                  Safety Advisory
                  <OpenInNewIcon fontSize="10"></OpenInNewIcon>
                </Link>
              </ListItem>
              <ListItem>
                <Link
                fontWeight="light"  
                  target="_blank"
                  color="#000"
                  variant="body1"
                  href=" https://github.com/nickypangers/passport-visa-api  "
                  sx={{ textDecoration: "none" }}
                >
                  Visa Requirements
                  <OpenInNewIcon fontSize="10"></OpenInNewIcon>
                </Link>
              </ListItem>
              <ListItem>
                <Link
                fontWeight="light"  
                  target="_blank"
                  color="#000"
                  variant="body1"
                  href=" https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search/api-reference "
                  sx={{ textDecoration: "none" }}
                >
                  Amadeus Flights API
                  <OpenInNewIcon fontSize="10"></OpenInNewIcon>
                </Link>
              </ListItem>
              <ListItem>
                <Link
                fontWeight="light"  
                  target="_blank"
                  color="#000"
                  variant="body1"
                  href=" https://github.com/jpatokal/openflights/blob/master/data/airports.dat
 "
                  sx={{ textDecoration: "none" }}
                >
                  Airports API
                  <OpenInNewIcon fontSize="10"></OpenInNewIcon>
                </Link>
              </ListItem>
            </List>
            <Box
              component={"img"}
              
              src={"journey.png"}
              alt="Data Connection"
              sx={{

                height: 400,
                width: 500,
                alignContent:"center", 
                maxHeight: { xs: 233, md: 300 },
                maxWidth: { xs: 350, md: 500 },
              }}
            ></Box>
          </Box>
          <Typography variant="h5" fontWeight={"550"}gutterBottom sx={{ mt: 3 }}>
            Task Abstraction
          </Typography>
          <Typography variant="h5" fontWeight={"550"}gutterBottom sx={{ mt: 3 }}>
            References
          </Typography>
          <Box>
            <Typography variant="text" gutterBottom>
              <List>
                <ListItem>
                  {" "}
                  <Link
                    target="_blank"
                    fontWeight={"light"}
                    color="#000"
                    variant="body1"
                    href="https://globe.gl/"
                    sx={{ textDecoration: "none" }}
                  >
                    Globe.GL. (n.d.). globe.gl. https://globe.gl/ Last accessed:
                    14/3-2025
                  </Link>{" "}
                </ListItem>
                <ListItem>
                  <Link
                    target="_blank"
                    fontWeight={"light"}
                    color="#000"
                    variant="body1"
                    href="https://vizhub.com/curran/parallel-coordinates-with-brushing"
                    sx={{ textDecoration: "none" }}
                  >
                    Parallel Coordinates with Brushing. (n.d.). VizHub.
                    https://vizhub.com/curran/parallel-coordinates-with-brushing
                    Last accessed: 14/3-2025
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    target="_blank"
                    fontWeight={"light"}
                    color="#000"
                    variant="body1"
                    href="https://link.springer.com/book/10.1007/978-3-540-74205-0"
                    sx={{ textDecoration: "none" }}
                  >
                    Xu, Y., Hong, W., Chen, N., Li, X., Liu, W., & Zhang, T.
                    (2007). Parallel Filter: a visual classifier based on
                    parallel coordinates and multivariate data analysis. In
                    Lecture notes in computer science (pp. 1172–1183).
                    https://doi.org/10.1007/978-3-540-74205-0_121{" "}
                  </Link>
                </ListItem>
              </List>
            </Typography>
          </Box>
          <Box
            sx={{
              mt: 4,
              pt: 2,
              borderTop: "1px solid rgba(0, 0, 0, 0.12)",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Journey. Amanda Arbinge, Amina-Kamra
              Maglić, Laieh Jwella, Kristín Hafsteinsdóttir, Shradha Retharekar.
            </Typography>
          </Box>
        </Box>
      </CustomCard>
    </Container>
  );
};

export default About;
