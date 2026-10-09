import React from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

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
  } = solicitud;

  const esEnviada = type === "sent";
  const estadoActual = aprobacion || estado;

  // Paleta de etiquetas de estado según tu diseño
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
      }}
    >
      <CardContent
        sx={{
          padding: "32px !important", // Padding exacto de Figma
          display: "flex",
          flexDirection: "column",
          gap: "16px", // Gap de 16px entre las 3 secciones principales
        }}
      >
        {/* 1. CARD HEADER INFO */}
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

        {/* 2. PRODUCT ROW */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#171717",
              lineHeight: 1.2,
            }}
          >
            {cantidad} {solicitud.producto?.unit || solicitud.unit || "kg"} de{" "}
            {producto_nombre || "—"}
          </Typography>
        </Box>

        {/* BLOQUE OPCIONAL: MOTIVO DE RECHAZO */}
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

        {/* 3. CARD FOOTER ACTIONS */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginTop: 0.5,
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
