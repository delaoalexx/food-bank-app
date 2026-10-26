import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Collapse,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function RequestCard({
  solicitud = {},
  showActions = true,
  onAprobar,
  onRechazar,
  type,
}) {
  const {
    transferencia_id,
    producto_nombre,
    cantidad,
    destino,
    origen,
    estado,
    aprobacion,
    error,
    created_at,
    items = [], // Arreglo de productos
  } = solicitud;

  const [expanded, setExpanded] = useState(false);

  const esEnviada = type === "sent";
  const estadoActual = aprobacion || estado;
  const tieneVariosProductos = items && items.length > 1;

  // Paleta de etiquetas de estado
  const estadoStyle = {
    aceptado: { bg: "#DCFCE7", text: "#029739", label: "ACEPTADO" },
    COMPLETADO: { bg: "#DCFCE7", text: "#029739", label: "ACEPTADO" },
    denegado: { bg: "#FEE2E2", text: "#DC2626", label: "DENEGADO" },
    FALLIDO: { bg: "#FEE2E2", text: "#DC2626", label: "DENEGADO" },
    en_espera: { bg: "#FEFCE8", text: "#EAB308", label: "EN ESPERA" },
    PENDIENTE: { bg: "#FEFCE8", text: "#EAB308", label: "EN ESPERA" },
  }[estadoActual] || {
    bg: "#F3F4F6",
    text: "#6B7280",
    label: String(estadoActual || "").toUpperCase(),
  };

  // Resumen principal cuando está colapsado
  const primerProducto = items.length > 0 ? items[0] : null;
  const productosVisibles = items.slice(0, 3);
  const restantes = items.length - productosVisibles.length;

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: "12px",
        border: "1px solid #E7E5E4",
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#FFFFFF",
        boxSizing: "border-box",
        overflow: "hidden",
        transition: "0.2s ease-in-out",
      }}
    >
      <CardContent
        sx={{
          padding: "24px 32px !important",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* 1. HEADER DE LA TARJETA */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 500,
              color: "#737373",
            }}
          >
            {esEnviada
              ? `Solicitud enviada a: ${origen || "—"}`
              : `Solicitud de: ${destino || "—"}`}
          </Typography>

          {estadoActual && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "8px",
                border: `1px solid ${estadoStyle.text}33`,
                backgroundColor: estadoStyle.bg,
                color: estadoStyle.text,
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              {estadoStyle.label}
            </Box>
          )}
        </Box>

        {/* 2. VISTA RESUMEN */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#171717",
              lineHeight: 1.2,
            }}
          >
            {tieneVariosProductos
              ? `${items.length} productos solicitados`
              : primerProducto
                ? `${primerProducto.cantidad} ${primerProducto.unit} de ${primerProducto.nombre}`
                : `${cantidad} ${solicitud.producto?.unit || solicitud.unit || "kg"} de ${producto_nombre || "—"}`}
          </Typography>

          {tieneVariosProductos && (
            <Button
              size="small"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: expanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.25s ease",
                  }}
                />
              }
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 600,
                color: "#029739",
                fontSize: "14px",
                "&:hover": { backgroundColor: "#E8F6ED" },
              }}
            >
              {expanded ? "Ocultar detalle" : "Ver detalle"}
            </Button>
          )}
        </Box>

        {tieneVariosProductos && !expanded && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
                  fontWeight: 400,
                }}
              >
                <Box component="span" sx={{ fontWeight: 400 }}>
                  {item.cantidad} {item.unit} {item.nombre}
                </Box>
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

        {/* 3. VISTA EXPANDIDA (DESPLEGABLE ACCORDION) */}
        {tieneVariosProductos && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                padding: "8px 16px",
                backgroundColor: "#F9FAFB",
                borderRadius: "12px",
                border: "1px solid #F3F4F6",
              }}
            >
              {items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    py: 1.25,
                    borderBottom:
                      index !== items.length - 1 ? "1px solid #F3F4F6" : "none",
                  }}
                >
                  <Typography
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 1.25,
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#171717",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ color: "#1F2937", fontWeight: 700 }}
                    >
                      •
                    </Box>
                    {item.nombre}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#1F2937",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.cantidad} {item.unit}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        )}

        {/* MOTIVO DE RECHAZO (SI EXISTE) */}
        {(aprobacion === "denegado" ||
          estadoActual === "FALLIDO" ||
          estadoActual === "denegado") &&
          error && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                padding: "16px",
                backgroundColor: "#F9FAFB",
                borderRadius: "12px",
                border: "1px solid #F3F4F6",
                width: "100%",
                boxSizing: "border-box",
                mt: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                MOTIVO DE RECHAZO
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "#334155",
                  fontWeight: 500,
                }}
              >
                {error}
              </Typography>
            </Box>
          )}

        {/* 4. FOOTER Y ACCIONES */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginTop: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              color: "#A3A3A3",
              fontWeight: 500,
            }}
          >
            {created_at
              ? `Fecha: ${new Date(created_at).toISOString().split("T")[0]}`
              : "Fecha: —"}
          </Typography>

          {/* Acciones de Aprobar / Rechazar */}
          {showActions && (aprobacion === "en_espera" || !aprobacion) && (
            <Box sx={{ display: "flex", gap: "12px" }}>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => onRechazar?.(solicitud)}
                sx={{
                  borderColor: "#E7E5E4",
                  color: "#44403C",
                  borderRadius: "12px",
                  minWidth: "160px",
                  paddingX: "20px",
                  paddingY: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  "&:hover": {
                    borderColor: "#A8A29E",
                    backgroundColor: "#F5F5F4",
                  },
                }}
              >
                Rechazar
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={() => onAprobar?.(transferencia_id)}
                sx={{
                  backgroundColor: "#029739",
                  color: "#FFFFFF",
                  borderRadius: "12px",
                  minWidth: "160px",
                  paddingX: "20px",
                  paddingY: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#15803D",
                    boxShadow: "none",
                  },
                }}
              >
                Aprobar
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default RequestCard;
