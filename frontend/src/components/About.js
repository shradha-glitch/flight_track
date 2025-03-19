import { Box, Typography, Container, Avatar, Link, List } from "@mui/material";
import Grid from "@mui/material/Grid2";
import CustomCard from "./card/Card";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ListItem from "@mui/material/ListItem";
import ImageList from "@mui/material";
import ReactPlayer from "react-player";

const About = () => {
  const team = [
    {
      name: "Amanda Arbinge",
      image: "/team/amanda.png",
      email: "aarbinge@kth.se",
      role: ["Front End", "API Calls", "Data Processing"],
    },
    {
      name: "Amina-Kamra Maglić",
      email: "maglic@kth.se",
      image: "/team/kamra.png",
      role: ["Visualisation design", "Front End", "User Testing"],
    },
    {
      name: "Laieh Jwella",
      email: "laieh@kth.se",
      image: "/team/laieh.png",
      role: ["Visualisation design", "Front End", "User Testing"],
    },
    {
      name: "Kristín Hafsteinsdóttir",
      email: "khaf@kth.se",
      image: "/team/kristin.png",
      role: ["Front End", "API Calls", "Data Processing", "User Testing"],
    },
    {
      name: "Shradha Retharekar",
      email: "shradha@kth.se",
      image: "/team/shradha.png",
      role: ["Backend", "Data Processing", "Hosting", "User Testing"],
    },
  ];
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <CustomCard sx={{ backgroundColor: "#CBC5B1" }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            About Journey
          </Typography>
          <Typography variant="body1" fontWeight="light" paragraph>
            Journey is a comprehensive flight planning and visualization tool
            that helps travelers explore destinations worldwide. You dont have
            to worry about juggling multiple website at once, our Users can book
            flights only from London between March 11 and March 31, 2025.
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

          <Typography variant="h5" fontWeight="550" gutterBottom sx={{ mt: 3 }}>
            How to Use (Tips)
          </Typography>
         
          <Typography variant="body1" fontWeight="550">
          Planning a trip with friends? ✈️
          </Typography>

          <Typography variant="body1" fontWeight="light" paragraph>
            You can add their passport details and include
            multiple passports if traveling with international friends. This
            feature visually highlights destinations you can visit together
            based on your combined passport privileges.
          </Typography>

          <Typography variant="body1" fontWeight="550">
          Compare Relationships on Axes 📈
          </Typography>

          <Typography variant="body1" fontWeight="light" paragraph>
          Use the parallel coordinates plot to compare multiple destinations. 
          You can analyze the relationships between price, weather conditions, or other factors 
          by dragging the name of the axis left or right.
          </Typography>

          <Typography variant="body1" fontWeight="550">
          Click on Destinations for Connections 🌍 
          </Typography>

          <Typography variant="body1" fontWeight="light" paragraph>
          Click on a destination on the globe to highlight its connections 
          in the results card. This helps you visually explore the best 
          travel options.
          </Typography>


          <Typography variant="h5" fontWeight="550" gutterBottom sx={{ mt: 3 }}>
            Features
          </Typography>
          <Typography variant="body1" fontWeight="light" paragraph>
            • Interactive 3D Globe Visualization and Parallel Coordinates Plot •
            Flight Routes • Real-time Weather Information • Travel Advisory
            Updates • Visa Requirement Details
          </Typography>
          <Typography variant="body1" fontWeight="light" paragraph>
            Built with Python, React, Material UI, D3.js and GlobeGL, Journey
            aims to make travel planning more intuitive and informative. The
            project is hosted using Vercel (Vercel, n.d.) for the frontend and
            Render (Render, n.d.) for the backend, following deployment guides
            by Andy's Tech Tutorials (n.d.) and Neupane (n.d.).
          </Typography>
          <Typography variant="h5" fontWeight="550" gutterBottom sx={{ mt: 3 }}>
            Demo Video
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ReactPlayer
              url="https://vimeo.com/1067218107"
              width="650px"
              height="394px"
              controls
            />
          </Box>
          <Typography variant="h5" fontWeight="550" gutterBottom sx={{ mt: 3 }}>
            The Team
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2, mb: 4 }}>
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
                  <Typography variant="h6" fontWeight="550">
                    {member.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight="400"
                    sx={{
                      color: "#1B1B1B",
                      mb: 0.5,
                      fontSize: "0.9rem",
                    }}
                  >
                    {member.email}
                  </Typography>

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
          <Typography variant="h5" fontWeight="550" gutterBottom sx={{ mt: 3 }}>
            Data Abstraction and Provenance
          </Typography>
          <Typography variant="body1" fontWeight={"light"}paragraph>
            Most of the data is connected to each other in the parallel
            coordinates plot (Parallel Coordinates with Brushing, n.d.), (Xu et
            al., 2007) or the Globe (Globe.GL, n.d.). The data is connected
            together either with AITA code, ISO2 code or Coordinates, see
            diagram below. The data was collected from various sources and then
            cleaned and transformed to fit our needs. These transformation were
            for the weather data, transforming it into a categorical data,
            deriving the average from daily weather information. The trip
            duration is derived from departure and return date. Journey uses
            following data:
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
                alignContent: "center",
                maxHeight: { xs: 233, md: 300 },
                maxWidth: { xs: 350, md: 500 },
              }}
            ></Box>
          </Box>
          <Typography
            variant="h5"
            fontWeight={"550"}
            gutterBottom
            sx={{ mt: 3 }}
          >
            Task Abstraction
          </Typography>

          <Typography variant="body1" fontWeight={"550"} color="red">
            Analyze (Munzner, 2014):
          </Typography>
          <Typography variant="body1" fontWeight="light" paragraph>
            • Consume: Users view and interpret flight data and travel
            information <br />• Discover: Users browse new destinations and
            travel possibilities <br />
            • Produce: System generates visualizations from raw data <br />
            • Derive: System calculates average weather conditions and trip
            durations from raw data <br />
          </Typography>

          <Typography variant="body1" fontWeight={"550"} color="green">
            Search (Munzner, 2014):
          </Typography>
          <Typography variant="body1" fontWeight="light" paragraph>
            • Browse: Users browse available destinations and flights freely.
            The users filter results based on known preferences or location of
            the data (price, weather, etc.). However, users search for specific
            flights without knowing exact details or target.
          </Typography>

          <Typography variant="body1" fontWeight={"550"} color="blue">
            Query (Munzner, 2014):
          </Typography>
          <Typography variant="body1" fontWeight="light" paragraph>
            • Identify: Users can find specific details about flights,
            destinations, and travel requirements <br />
            • Compare: Users can evaluate different travel options, prices, and
            conditions <br />
          </Typography>

          <Typography variant="body1" fontWeight={"550"} color="yellow">
            Target (Munzner, 2014):
          </Typography>
          <Typography variant="body1" fontWeight="light" paragraph>
            • Extremes: Users can identify best/worst options based on their
            criteria on the parallel coordinates plot <br />
            • Paths: Users can visualize and analyze flight routes <br />
          </Typography>

          <Typography
            variant="h5"
            fontWeight={"550"}
            gutterBottom
            sx={{ mt: 3 }}
          >
            References
          </Typography>
          <Box>
            <Typography variant="text" gutterBottom>
              <List>
                <ListItem>
                  <Link
                    target="_blank"
                    fontWeight={"light"}
                    color="#000"
                    variant="body1"
                    href="https://www.youtube.com/watch?v=UuRwz35cUoM"
                    sx={{ textDecoration: "none" }}
                  >
                    Andy's Tech Tutorials. (n.d.). How to deploy a React app on
                    Vercel for free [Video]. YouTube.
                    https://www.youtube.com/watch?v=UuRwz35cUoM Last accessed:
                    18/3-2025
                  </Link>
                </ListItem>
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
                    href="https://doi.org/10.1201/b17511-3"
                    sx={{ textDecoration: "none" }}
                  >
                    Munzner, T. (2014). Why: Task abstraction (1st ed.). A K
                    Peters/CRC Press. https://doi.org/10.1201/b17511-3 Last
                    accessed: 18/3-2025
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    target="_blank"
                    fontWeight={"light"}
                    color="#000"
                    variant="body1"
                    href="https://www.youtube.com/watch?v=_COyD1CExKU"
                    sx={{ textDecoration: "none" }}
                  >
                    Neupane, A. (n.d.). How to deploy FastAPI app for free on
                    Render [Video]. YouTube.
                    https://www.youtube.com/watch?v=_COyD1CExKU Last accessed:
                    18/3-2025
                  </Link>
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
                    href="https://render.com/"
                    sx={{ textDecoration: "none" }}
                  >
                    Render. (n.d.). Render - Cloud application hosting for
                    developers. https://render.com/ Last accessed: 18/3-2025
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    target="_blank"
                    fontWeight={"light"}
                    color="#000"
                    variant="body1"
                    href="https://vercel.com/"
                    sx={{ textDecoration: "none" }}
                  >
                    Vercel. (n.d.). Vercel - Develop. Preview. Ship.
                    https://vercel.com/ Last accessed: 18/3-2025
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
