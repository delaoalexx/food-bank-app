import React from "react";
import { Box, Typography, Chip } from "@mui/material";

const HistoryCard = ({
  icon,
  iconBg,
  iconColor,
  title,
  details = [],
  date,
  status,
  isLast,
}) => {
  const formattedDate = (() => {
    if (!date) return "Sin fecha";
    const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(date) ? date : `${date}Z`;
    return new Date(normalized).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  })();

  const getStatusStyles = () => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "ACEPTADO":
      case "APROBADO":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "DENEGADO":
      case "RECHAZADO":
        return { bg: "#FEE2E2", text: "#DC2626" };
      case "EN ESPERA":
      case "PENDIENTE":
        return { bg: "#FEF9C3", text: "#854D0E" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "10px",
            backgroundColor: iconBg,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: iconColor,
            "& svg": { fontSize: 22 },
          }}
        >
          {icon}
        </Box>
        {!isLast && (
          <Box
            sx={{
              width: "2px",
              minHeight: "70px",
              backgroundColor: "#E7E5E4",
              mt: 1,
            }}
          />
        )}
      </Box>

      <Box sx={{ flexGrow: 1, pb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{ fontWeight: 700, color: "#171717", fontSize: "18px" }}
          >
            {title}
          </Typography>
          {status && (
            <Chip
              label={status.replace(/_/g, " ")}
              size="small"
              sx={{
                backgroundColor: getStatusStyles().bg,
                color: getStatusStyles().text,
                fontWeight: 600,
                borderRadius: 2,
                "& .MuiChip-label": { paddingX: 1.5 },
              }}
            />
          )}
        </Box>

        {details.map((detail, index) => (
          <Typography
            key={index}
            sx={{ color: "#525252", mt: 0.5, fontSize: "15px" }}
          >
            {detail}
          </Typography>
        ))}

        <Typography sx={{ color: "#A3A3A3", fontSize: "13px", mt: 1 }}>
          {formattedDate}
        </Typography>
      </Box>
    </Box>
  );
};

export default HistoryCard;
