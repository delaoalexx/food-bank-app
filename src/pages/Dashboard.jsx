// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Box, Typography } from "@mui/material";
import StatCard from "../components/dashboard/StatCard";
import InfoPanel from "../components/dashboard/InfoPanel";
import EmptyState from "../components/common/EmptyState";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { PieChart, LineChart } from "@mui/x-charts";
import {
  getProducts,
  getBeneficiarios,
  getSolicitudesRecibidas,
} from "../services/api";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsData, familiasData, solicitudesData] = await Promise.all(
          [getProducts(), getBeneficiarios(), getSolicitudesRecibidas()],
        );

        setProducts(productsData);
        setFamilias(familiasData);
        setSolicitudes(solicitudesData);
      } catch (error) {
        console.error(error);
      }
    };

    setLoading(true);
    fetchDashboardData().finally(() => setLoading(false));

    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const stockBajo = products.filter((p) => p.cantidad > 0 && p.cantidad <= 10);
  const solicitudesPendientes = solicitudes.filter(
    (s) => s.aprobacion === "en_espera",
  );

  const chartPieData = [
    { id: 0, value: 400, label: "opcion 1", color: "#029739" },
    { id: 1, value: 100, label: "opcion 1", color: "#FA7B0A" },
    { id: 2, value: 300, label: "opcion 1", color: "#D0F38B" },
  ];

  const lineDays = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const entradasData = [2200, 1500, 9800, 4000, 4800, 3900, 4200];
  const salidasData = [4000, 3200, 2000, 2800, 1900, 2600, 3500];

  return (
    <MainLayout>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 2, color: "#171717" }}
      >
        Dashboard
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1.2fr 0.8fr",
          },
          gap: 2,
          width: "100%",
        }}
      >
        {/* COLUMNA IZQUIERDA */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* StatCards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              width: "100%",
            }}
          >
            <StatCard
              title="Productos en Stock"
              value={
                loading ? "..." : products.filter((p) => p.cantidad > 0).length
              }
              description="productos totales"
            />
            <StatCard
              title="Familias registradas"
              value={loading ? "..." : familias.length}
              description="beneficiarios registrados"
            />
          </Box>

          {/* Gráfica Donut */}
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: "#171717" }}
            >
              Productos más solicitados
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 260,
              }}
            >
              <PieChart
                series={[
                  {
                    data: chartPieData,
                    innerRadius: 65,
                    outerRadius: 100,
                    paddingAngle: 2,
                    cornerRadius: 4,
                  },
                ]}
                height={240}
                slotProps={{
                  legend: {
                    direction: "column",
                    position: { vertical: "top", horizontal: "right" },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Gráfica de Líneas */}
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: "#171717" }}
            >
              Entradas y salidas de productos
            </Typography>

            <Box sx={{ height: 300, width: "100%" }}>
              <LineChart
                xAxis={[{ data: lineDays, scaleType: "band" }]}
                series={[
                  {
                    data: entradasData,
                    label: "Entradas",
                    color: "#029739",
                    showMark: true,
                  },
                  {
                    data: salidasData,
                    label: "Salidas",
                    color: "#FA7B0A",
                    showMark: true,
                  },
                ]}
                height={280}
              />
            </Box>
          </Box>
        </Box>

        {/* COLUMNA DERECHA */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "100%",
          }}
        >
          {/* Panel 1: Solicitudes por responder */}
          <InfoPanel
            title={`Solicitudes por responder (${solicitudesPendientes.length})`}
          >
            {solicitudesPendientes.length === 0 ? (
              <EmptyState
                icon={CheckCircleIcon}
                title="Todo al día"
                description="No tienes solicitudes pendientes por responder."
              />
            ) : (
              solicitudesPendientes.map((s) => (
                <Box
                  key={s.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.2,
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>
                      {s.producto_nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.cantidad} {s.producto?.unit || "kg"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      backgroundColor: "#FA7B0A",
                      color: "#ffffff",
                      px: 1.5,
                      py: 0.4,
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {s.destino || "La Paz"}
                  </Box>
                </Box>
              ))
            )}
          </InfoPanel>

          {/* Panel 2: Productos con bajo stock */}
          <InfoPanel title={`Productos con bajo stock (${stockBajo.length})`}>
            {stockBajo.length === 0 ? (
              <EmptyState
                icon={Inventory2Icon}
                title="Stock óptimo"
                description="No hay productos con bajo inventario actualmente."
              />
            ) : (
              stockBajo.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.2,
                    borderBottom: "1px solid #F5F5F4",
                  }}
                >
                  <Typography sx={{ color: "#171717", fontWeight: 500 }}>
                    {p.nombre}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#E11D48",
                    }}
                  >
                    {p.cantidad} {p.unit || "kg"}
                  </Typography>
                </Box>
              ))
            )}
          </InfoPanel>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default Dashboard;
