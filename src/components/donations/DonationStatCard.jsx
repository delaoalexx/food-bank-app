import React from "react";
import { Paper, Typography } from "@mui/material";

const DonationStatCard = ({ value, label }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        padding: "20px 24px",
        borderRadius: "12px",
        border: "1px solid #E7E5E4",
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 500,
          color: "#737373",
          marginBottom: "4px",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "36px",
          fontWeight: 700,
          color: "#171717",
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
};

export default DonationStatCard;