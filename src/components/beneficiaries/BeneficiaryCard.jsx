import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Collapse,
  IconButton,
  Pagination,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const BeneficiaryCard = ({ family, onNuevaEntrega }) => {
  const [expanded, setExpanded] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 3;

  const historyItems = family.history || family.entregas || [];
  const startIndex = (historyPage - 1) * itemsPerPage;
  const currentHistory = historyItems.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalHistoryPages = Math.ceil(historyItems.length / itemsPerPage);

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* HEADER FILA PRINCIPAL */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "18px",
            color: "#1F2937",
          }}
        >
          {family.nombre || family.name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PeopleAltIcon sx={{ fontSize: 18, color: "#F97316" }} />
            <Typography
              sx={{ fontSize: "14px", color: "#1F2937", fontWeight: 400 }}
            >
              {family.familia?.cantidad_miembros ?? family.members ?? 0}{" "}
              miembros
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Inventory2Icon sx={{ fontSize: 18, color: "#F97316" }} />
            <Typography
              sx={{ fontSize: "14px", color: "#1F2937", fontWeight: 400 }}
            >
              {family.entregas?.length ?? family.deliveries ?? 0} entregas
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => onNuevaEntrega(family)}
            sx={{
              backgroundColor: "#029739",
              color: "#FFFFFF",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "12px",
              paddingX: "16px",
              paddingY: "8px",
              boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
              "&:hover": {
                backgroundColor: "#15803d",
                boxShadow: "none",
              },
            }}
          >
            Nueva Entrega
          </Button>

          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{ color: "#4B5563" }}
          >
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* CONTENIDO DESPLEGABLE */}
      <Collapse in={expanded}>
        <Box
          sx={{
            padding: "24px",
            borderTop: "1px solid #F3F4F6",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* GRID DE DETALLES */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#9CA3AF",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  mb: 0.5,
                }}
              >
                DIRECCIÓN
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>
                {family.familia?.direccion || "Sin dirección"}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#9CA3AF",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  mb: 0.5,
                }}
              >
                TELÉFONO
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>
                {family.familia?.telefono || "Sin teléfono"}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#9CA3AF",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  mb: 0.5,
                }}
              >
                FECHA DE REGISTRO
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#1F2937" }}>
                {family.created_at
                  ? new Date(family.created_at).toISOString().split("T")[0]
                  : "2026-01-15"}
              </Typography>
            </Box>
          </Box>

          {/* HISTORIAL DE ENTREGAS CON PAGINACIÓN DE 3 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#1F2937",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
              }}
            >
              HISTORIAL DE ENTREGAS
            </Typography>

            {historyItems.length === 0 ? (
              <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>
                Sin entregas registradas.
              </Typography>
            ) : (
              <>
                {currentHistory.map((e, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "16px 20px",
                      gap: "32px",
                      backgroundColor: "#F9FAFB",
                      borderRadius: "12px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: "#1F2937",
                        fontWeight: 500,
                      }}
                    >
                      {e.date || new Date(e.fecha).toISOString().split("T")[0]}
                    </Typography>

                    <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {(
                        e.items || [
                          `${e.cantidad} ${e.producto?.unit || "kg"} ${e.producto?.nombre ?? "producto"}`,
                        ]
                      ).map((item, itemIdx) => (
                        <Box
                          key={itemIdx}
                          sx={{
                            backgroundColor: "#F97316",
                            color: "#FFFFFF",
                            borderRadius: "50px",
                            padding: "4px 12px",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          {item}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}

                {totalHistoryPages > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                  >
                    <Pagination
                      count={totalHistoryPages}
                      page={historyPage}
                      onChange={(_, value) => setHistoryPage(value)}
                      size="small"
                      sx={{
                        "& .MuiPaginationItem-root.Mui-selected": {
                          backgroundColor: "#029739",
                          color: "#ffffff",
                          "&:hover": {
                            backgroundColor: "#15803d",
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default BeneficiaryCard;