import React from "react";
import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

const EmptyState = ({
  icon: Icon = InboxIcon,
  title = "Sin información",
  description = "No hay datos para mostrar en este momento.",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: 140,
        py: 2,
        px: 2,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: "#E8F5E9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#029739",
          mb: 1.5,
        }}
      >
        <Icon sx={{ fontSize: 26 }} />
      </Box>

      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, color: "#44403C", mb: 0.5 }}
      >
        {title}
      </Typography>

      <Typography variant="caption" sx={{ color: "#A8A29E", maxWidth: 220 }}>
        {description}
      </Typography>
    </Box>
  );
};

export default EmptyState;
