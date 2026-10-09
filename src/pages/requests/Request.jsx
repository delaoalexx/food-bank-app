import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Box, Typography, Button } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import Sent from "./Sent";
import Received from "./Received";

const Request = () => {
  const [selected, setSelected] = useState("received");
  const [open, setOpen] = useState(false);

  return (
    <MainLayout>
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
      >
        {/* TÍTULO */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#171717" }}>
          Solicitudes
        </Typography>

        {/* CONTENEDOR DE PESTAÑAS Y BOTÓN NUEVA SOLICITUD */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Pestañas Recibidas / Enviadas */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              onClick={() => setSelected("received")}
              startIcon={<MailIcon />}
              sx={{
                backgroundColor:
                  selected === "received" ? "#FFFFFF" : "transparent",
                color: selected === "received" ? "#171717" : "#737373",
                border:
                  selected === "received"
                    ? "1px solid #E7E5E4"
                    : "1px solid transparent",
                boxShadow:
                  selected === "received"
                    ? "0px 1px 2px rgba(0, 0, 0, 0.05)"
                    : "none",
                borderRadius: "12px",
                paddingX: "24px",
                paddingY: "12px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                "&:hover": {
                  backgroundColor: "#FFFFFF",
                },
              }}
            >
              Recibidas
            </Button>

            <Button
              onClick={() => setSelected("sent")}
              startIcon={<SendIcon />}
              sx={{
                backgroundColor:
                  selected === "sent" ? "#FFFFFF" : "transparent",
                color: selected === "sent" ? "#171717" : "#737373",
                border:
                  selected === "sent"
                    ? "1px solid #E7E5E4"
                    : "1px solid transparent",
                boxShadow:
                  selected === "sent"
                    ? "0px 1px 2px rgba(0, 0, 0, 0.05)"
                    : "none",
                borderRadius: "12px",
                paddingX: "24px",
                paddingY: "12px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                "&:hover": {
                  backgroundColor: "#FFFFFF",
                },
              }}
            >
              Enviadas
            </Button>
          </Box>

          {/* Botón Nueva Solicitud (Solo visible en 'sent') */}
          {selected === "sent" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{
                backgroundColor: "#029739",
                color: "#FFFFFF",
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                paddingX: "24px",
                paddingY: "10px",
                boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
                "&:hover": {
                  backgroundColor: "#15803d",
                  boxShadow: "none",
                },
              }}
            >
              Nueva solicitud
            </Button>
          )}
        </Box>

        {/* VISTAS */}
        {selected === "received" && <Received />}
        {selected === "sent" && <Sent open={open} setOpen={setOpen} />}
      </Box>
    </MainLayout>
  );
};

export default Request;
