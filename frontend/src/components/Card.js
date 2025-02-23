import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const CustomCard = ({ title, children, sx }) => {
  return (
    <Card sx={{ width: "100%", height: "100%", justifyContent: 'center', ...sx }}>
      {title && (
        <CardContent sx={{ pb: 0 }}>
          <Typography variant="h6">{title}</Typography>
        </CardContent>
      )}
      <Box sx={{ width: "100%", height: "100%", flexGrow: 1 }}>{children}</Box>
    </Card>
  );
};

export default CustomCard;
