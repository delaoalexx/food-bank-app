import { useState } from "react";
import { Box, Typography, Button, Chip, Collapse } from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const BeneficiaryCard = ({ family, onNuevaEntrega }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box sx={{ backgroundColor: "#ffffff", borderRadius: 4, border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", padding: "16px 24px", gap: 2 }}>
        <Box sx={{ backgroundColor: "#fff4ed", borderRadius: 3, padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <PeopleAltOutlinedIcon sx={{ color: "#e07a2f" }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography fontWeight="bold" fontSize="16px">{family.nombre}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PhoneOutlinedIcon sx={{ fontSize: 14, color: "#6b7280" }} />
            <Typography fontSize="13px" color="text.secondary">
              {family.familia?.telefono || "Sin teléfono"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3, marginRight: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: "#6b7280" }} />
            <Typography fontSize="14px" color="text.secondary">
              {family.familia?.cantidad_miembros ?? 0} miembros
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: "#6b7280" }} />
            <Typography fontSize="14px" color="text.secondary">
              {family.entregas?.length ?? 0} entregas
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained" color="warning"
          onClick={() => onNuevaEntrega(family)}
          sx={{ borderRadius: 3, textTransform: "none", paddingX: 2, marginRight: 1 }}
        >
          Nueva entrega
        </Button>
        <Box onClick={() => setExpanded(!expanded)} sx={{ cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}>
          {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ padding: "0 24px 24px", borderTop: "1px solid #f3f4f6" }}>
          <Box sx={{ display: "flex", gap: 6, marginTop: 2, marginBottom: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                Dirección
              </Typography>
              <Typography fontSize="14px" mt={0.5}>
                {family.familia?.direccion || "Sin dirección"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                Teléfono
              </Typography>
              <Typography fontSize="14px" mt={0.5}>
                {family.familia?.telefono || "Sin teléfono"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                Miembros
              </Typography>
              <Typography fontSize="14px" mt={0.5}>
                {family.familia?.cantidad_miembros ?? 0}
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" fontWeight="bold" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
            Historial de Entregas
          </Typography>

          <Box sx={{ marginTop: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
            {family.entregas?.length === 0 && (
              <Typography fontSize="14px" color="text.secondary">Sin entregas registradas.</Typography>
            )}
            {family.entregas?.map((e, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 16px", backgroundColor: "#f9fafb", borderRadius: 2,
                  cursor: "pointer", "&:hover": { backgroundColor: "#f3f4f6" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography fontSize="14px" fontWeight="500">
                    {new Date(e.fecha).toLocaleDateString("es-MX")}
                  </Typography>
                  <Chip
                    label={`${e.cantidad} ${e.producto?.nombre ?? "producto"}`}
                    size="small"
                    sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32", fontSize: "12px" }}
                  />
                </Box>
                <ChevronRightIcon sx={{ color: "#9ca3af", fontSize: 18 }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default BeneficiaryCard;