import React from "react";
import { Card, CardContent, Box } from "@mui/material";

const CustomCard = ({ title, children, sx }) => {
  return (
    <Card sx={{ width: "100%", height: "100%", ...sx }}>
      {title && (
        <CardContent sx={{ pb: 0 }}>
        </CardContent>
      )}
      <Box sx={{ width: "100%", height: "100%", flexGrow: 1 }}>{children}</Box>
    </Card>
  );
};

export default CustomCard;
