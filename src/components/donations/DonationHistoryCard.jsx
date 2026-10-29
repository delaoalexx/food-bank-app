import React, { useState } from "react";
import { Box, Typography, Button, Collapse } from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const DonationHistoryCard = ({
  donor = "",
  items = [],
  description = "",
  date = "",
  isLast = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const listaItems =
    items.length > 0
      ? items
      : description
        ? [{ nombre: description, cantidad: "", unit: "" }]
        : [];

  const tieneVarios = listaItems.length > 1;
  const productosVisibles = listaItems.slice(0, 3);
  const restantes = listaItems.length - productosVisibles.length;

  return (
    <Box
      sx={{
        py: 2.5,
        borderBottom: isLast ? "none" : "1px solid #E7E5E4",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: "16px", color: "#171717" }}
          >
            {donor}
          </Typography>

          <Typography
            sx={{ fontSize: "14px", color: "#737373", fontWeight: 500 }}
          >
            {listaItems.length === 1
              ? "1 producto donado"
              : `${listaItems.length} productos donados`}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              color: "#737373",
            }}
          >
            <CalendarTodayOutlinedIcon sx={{ fontSize: "16px" }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
              {date}
            </Typography>
          </Box>

          {tieneVarios && (
            <Button
              size="small"
              onClick={() => setExpanded((prev) => !prev)}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: expanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.25s ease",
                  }}
                />
              }
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                color: "#029739",
                fontSize: "14px",
                padding: "2px 6px",
                "&:hover": { backgroundColor: "#E8F6ED" },
              }}
            >
              {expanded ? "Ocultar detalle" : "Ver detalle"}
            </Button>
          )}
        </Box>
      </Box>

      {!expanded && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
          {productosVisibles.map((item, index) => (
            <Box
              key={index}
              sx={{
                px: 1.75,
                py: 0.5,
                borderRadius: "50px",
                backgroundColor: "#FA7B0A",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {item.nombre} {item.cantidad} {item.unit}
            </Box>
          ))}

          {restantes > 0 && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "50px",
                border: "1px dashed #A3A3A3",
                fontSize: "13px",
                fontWeight: 600,
                color: "#737373",
              }}
            >
              +{restantes} más
            </Box>
          )}
        </Box>
      )}

      {tieneVarios && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E7E5E4",
              boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
              mt: 1,
            }}
          >
            {listaItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  borderBottom:
                    index !== listaItems.length - 1
                      ? "1px solid #F3F4F6"
                      : "none",
                }}
              >
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "#171717",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#1F2937",
                    }}
                  />
                  {item.nombre}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "#1F2937",
                  }}
                >
                  {item.cantidad} {item.unit}
                </Typography>
              </Box>
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default DonationHistoryCard;
