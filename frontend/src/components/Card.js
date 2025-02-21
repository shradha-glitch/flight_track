import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const CustomCard = ({ title }) => (
  <Card sx={{ padding: 2, boxShadow: 1 }}>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
    </CardContent>
  </Card>
);

export default CustomCard;
