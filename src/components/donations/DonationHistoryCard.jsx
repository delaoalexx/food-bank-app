import React from "react";
import { Box, Typography } from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

const DonationHistoryCard = ({ donor, description, date, isLast }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: isLast ? "none" : "1px solid #C6C6C8",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Nombre (18px) y Detalle */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: "16px", 
            color: "#171717",
          }}
        >
          {donor || "Donante anónimo"}
        </Typography>
        <Typography
          sx={{
            fontSize: "14px",
            color: "#737373",
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Fecha a la derecha */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, color: "#A3A3A3" }}
      >
        <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
        <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
          {date}
        </Typography>
      </Box>
    </Box>
  );
};

export default DonationHistoryCard;