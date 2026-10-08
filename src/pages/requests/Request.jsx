import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { Box, Button, Badge } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import DetailsIcon from "@mui/icons-material/Details";
import Sent from "./Sent";
import Received from "./Received";

const Request = () => {
  const [selected, setSelected] = useState("received");
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          padding: "40px",
          flex: 1,
          height: "100vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ fontSize: "48px", marginBottom: "30px" }}>Solicitudes</h1>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={() => setSelected("received")}
              startIcon={<InboxOutlinedIcon />}
              sx={{
                backgroundColor:
                  selected === "received" ? "#ffffff" : "transparent",
                color: selected === "received" ? "#111827" : "#6b7280",
                borderRadius: 4,
                paddingX: 3,
                paddingY: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "18px",
                boxShadow:
                  selected === "received"
                    ? "0px 2px 8px rgba(0,0,0,0.08)"
                    : "none",
                "&:hover": { backgroundColor: "#ffffff" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                Recibidas
              </Box>
            </Button>

            <Button
              onClick={() => setSelected("sent")}
              startIcon={<DetailsIcon />}
              sx={{
                backgroundColor:
                  selected === "sent" ? "#ffffff" : "transparent",
                color: selected === "sent" ? "#111827" : "#6b7280",
                borderRadius: 4,
                paddingX: 3,
                paddingY: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "18px",
                boxShadow:
                  selected === "sent" ? "0px 2px 8px rgba(0,0,0,0.08)" : "none",
                "&:hover": { backgroundColor: "#ffffff" },
              }}
            >
              Enviadas
            </Button>
          </Box>

          {selected === "sent" && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => setOpen(true)}
              sx={{ borderRadius: 3, textTransform: "none", paddingX: 3 }}
            >
              + Nueva solicitud
            </Button>
          )}
        </Box>

        {selected === "received" && <Received />}
        {selected === "sent" && <Sent open={open} setOpen={setOpen} />}
      </div>
    </div>
  );
};

export default Request;