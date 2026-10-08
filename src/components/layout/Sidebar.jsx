import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Badge from "@mui/material/Badge";
import logo from "../../assets/logo.jpeg";
import { CURRENT_NODE, getSolicitudesRecibidas } from "../../services/api";

import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
} from "@mui/material";

import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Public as NetworkIcon,
  Mail as RequestIcon,
  VolunteerActivism as DonationIcon,
  People as BeneficiaryIcon,
  History as HistoryIcon,
} from "@mui/icons-material";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificaciones, setNotificaciones] = useState(0);
  const [open, setOpen] = useState(false);

  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const branchNames = {
    lapaz: "La Paz",
    comondu: "Comondú",
    loreto: "Loreto",
    mulege: "Mulegé",
  };

  const currentBranch = branchNames[CURRENT_NODE] || "Comondú";

  useEffect(() => {
    const cargarPendientes = async () => {
      try {
        const solicitudes = await getSolicitudesRecibidas();
        const pendientes = solicitudes.filter(
          (s) =>
            String(s.aprobacion || "")
              .toLowerCase()
              .trim() === "en_espera",
        );
        setNotificaciones(pendientes.length);
      } catch (error) {
        console.error(error);
      }
    };

    cargarPendientes();
    const interval = setInterval(cargarPendientes, 5000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Inventario", icon: <InventoryIcon />, path: "/inventory" },
    { text: "Red de Inventarios", icon: <NetworkIcon />, path: "/network" },
    { text: "Solicitudes", icon: <RequestIcon />, path: "/requests" },
    { text: "Donaciones", icon: <DonationIcon />, path: "/donations" },
    {
      text: "Beneficiarios",
      icon: <BeneficiaryIcon />,
      path: "/beneficiaries",
    },
    { text: "Historial", icon: <HistoryIcon />, path: "/history" },
  ];

  const handleToggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleNavigation = (path) => {
    if (activePath === path) return;

    setActivePath(path);

    if (open) {
      setOpen(false);
      setTimeout(() => {
        navigate(path);
      }, 250);
    } else {
      navigate(path);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 260 : 92,
        flexShrink: 0,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "& .MuiDrawer-paper": {
          width: open ? 240 : 72,
          height: "calc(100vh - 20px)",
          top: "10px",
          left: "10px",
          position: "fixed",
          boxSizing: "border-box",
          backgroundColor: "#1F2937",
          color: "#ffffff",
          border: "none",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 2,
          px: open ? 2 : 0,
          overflowX: "hidden",
          transition:
            "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          mb: 2,
          width: "100%",
          minHeight: 48,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}
        >
          {open && (
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                objectFit: "cover",
                backgroundColor: "#ffffff",
                p: 0.2,
                flexShrink: 0,
                opacity: open ? 1 : 0,
                transition: "opacity 0.2s ease-in-out",
              }}
            />
          )}

          <Box
            sx={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              opacity: open ? 1 : 0,
              maxWidth: open ? 140 : 0,
              transition:
                "opacity 0.2s ease-in-out, max-width 0.3s ease-in-out",
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontSize: "10px", display: "block" }}
            >
              TU SUCURSAL
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, lineHeight: 1.1 }}
            >
              {currentBranch}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={handleToggleOpen}
          sx={{ color: "#ffffff", p: 0.5 }}
        >
          {open ? (
            <CloseIcon sx={{ fontSize: 22 }} />
          ) : (
            <MenuIcon sx={{ fontSize: 26 }} />
          )}
        </IconButton>
      </Box>

      {/* LISTA DE ÍCONOS Y TEXTOS */}
      <List
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2, // 16px entre iconos
          p: 0,
          m: 0,
        }}
      >
        {menuItems.map((item) => {
          const isSelected = activePath === item.path;

          return (
            <ListItemButton
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              selected={isSelected}
              disableGutters
              sx={{
                width: open ? "100%" : 48,
                height: 48,
                minHeight: 48,
                borderRadius: "12px",
                px: open ? 2 : 0,
                justifyContent: open ? "flex-start" : "center",
                alignItems: "center",
                transition:
                  "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&.Mui-selected": {
                  backgroundColor: "#029739",
                  "&:hover": {
                    backgroundColor: "#15803d",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#ffffff",
                  minWidth: open ? 36 : 0,
                  width: open ? "auto" : 48,
                  justifyContent: "center",
                  alignItems: "center",
                  m: 0,
                  p: 0,
                  transition: "min-width 0.4s ease",
                }}
              >
                {item.text === "Solicitudes" ? (
                  <Badge badgeContent={notificaciones} color="error" max={99}>
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>

              {/* EQUIVALENTE EXACTO AL CSS DEL VIDEO */}
              <Box
                component="span"
                sx={{
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 400,
                  whiteSpace: "nowrap", // Evita saltos de línea[cite: 16]
                  opacity: open ? 1 : 0, // Control de visibilidad por opacidad[cite: 16]
                  pointerEvents: open ? "auto" : "none", // Desactiva clics cuando está oculto[cite: 16]
                  transform: open ? "translateX(0)" : "translateX(-10px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease", // Transición idéntica a 0.4s[cite: 16]
                  overflow: "hidden",
                }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "14px",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
              </Box>
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
