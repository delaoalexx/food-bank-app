// src/components/dashboard/InfoPanel.jsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const InfoPanel = ({ title, children, scrollable = true }) => {
  return (
    <Card
      sx={{
        borderRadius: "12px",
        border: "1px solid #E7E5E4",
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#FFFFFF",
        flex: 1, // Hace que cada InfoPanel tome el 50% de la altura vertical disponible
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden",
        minHeight: 0, // Necesario en flexbox para habilitar scroll interno
      }}
    >
      <CardContent
        sx={{
          padding: "16px !important",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#171717",
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* CONTENIDO CON SCROLL DINÁMICO HASTA EL BORDEN INFERIOR */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: scrollable ? "auto" : "visible",
            pr: scrollable ? 1 : 0,

            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#A8A29E",
              borderRadius: "999px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
        >
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InfoPanel;
