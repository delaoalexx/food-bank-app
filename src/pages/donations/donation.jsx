import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Pagination, Skeleton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MainLayout from "../../components/layout/MainLayout";
import DonationStatCard from "../../components/donations/DonationStatCard";
import DonationHistoryCard from "../../components/donations/DonationHistoryCard";
import DonationForm from "../../components/donations/DonationForm";
import EmptyState from "../../components/common/EmptyState";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { getDonaciones } from "../../services/api";
import { BarChart } from "@mui/x-charts/BarChart";

const Donation = () => {
  const [open, setOpen] = useState(false);
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchDonaciones = async () => {
    setLoading(true);
    try {
      const data = await getDonaciones();
      const mapped = data.map((d) => ({
        id: d.id,
        donor: d.donante,
        description: `${d.cantidad} ${d.producto?.unit || "pz"} ${
          d.producto?.nombre || "producto"
        }`.trim(),
        date: new Date(d.fecha).toISOString().split("T")[0],
      }));

      setDonaciones(mapped);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error cargando donaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonaciones();
  }, []);

  const totalProductos = donaciones.reduce((acc, d) => {
    const num = parseInt(d.description);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDonaciones = donaciones.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(donaciones.length / itemsPerPage);

  // Datos para la gráfica de donaciones recibidas
  const chartDays = [
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
    "Domingo",
  ];
  const chartData = [2, 5, 3, 8, 4, 9, 3];

  return (
    <MainLayout>
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}
      >
        {/* 1. HEADER SECTION */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            minHeight: "44px",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#171717" }}>
            Donaciones
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              backgroundColor: "#029739",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              paddingX: 2.5,
              paddingY: 1,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#15803d",
                boxShadow: "none",
              },
            }}
          >
            Registrar Donación
          </Button>
        </Box>

        {/* 2. STATS & GRAPH SECTION */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "264px 1fr" }, // 264px fijos para stats, 1fr para que la gráfica llene sin dejar blanco
            gap: "32px",
            alignItems: "stretch",
            width: "100%",
          }}
        >
          {/* Tarjetas de Estadísticas (Ancho exacto de Figma: 264px) */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <DonationStatCard
              value={donaciones.length}
              label="Donaciones totales"
            />
            <DonationStatCard
              value={totalProductos}
              label="Productos recibidos"
            />
          </Box>

          {/* Área de Gráfica (Ocupa todo el espacio restante sin barras deformes) */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "20px",
                color: "#171717",
                mb: 0.5,
              }}
            >
              Donaciones recibidas
            </Typography>

            <Box sx={{ width: "100%", height: 210 }}>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: chartDays,
                    categoryGapRatio: 0.65, // Genera separación limpia para que las barras no se ensanchen
                  },
                ]}
                series={[{ data: chartData, color: "#029739" }]}
                height={210}
                margin={{ top: 15, bottom: 25, left: 25, right: 10 }}
              />
            </Box>
          </Box>
        </Box>

        {/* 3. HISTORIAL DE DONACIONES */}
        <Box sx={{ width: "100%", marginTop: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "20px",
              color: "#171717",
              marginBottom: 1,
            }}
          >
            Historial de Donaciones
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={60} />
              ))}
            </Box>
          ) : donaciones.length === 0 ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <EmptyState
                icon={VolunteerActivismIcon}
                title="Sin donaciones registradas"
                description="Aún no se han registrado donaciones de alimentos o insumos."
              />
            </Box>
          ) : (
            <>
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                {currentDonaciones.map((d, index) => (
                  <DonationHistoryCard
                    key={d.id}
                    donor={d.donor}
                    description={d.description}
                    date={d.date}
                    isLast={index === currentDonaciones.length - 1}
                  />
                ))}
              </Box>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, value) => setCurrentPage(value)}
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

      {/* MODAL FORMULARIO */}
      <DonationForm open={open} setOpen={setOpen} onSuccess={fetchDonaciones} />
    </MainLayout>
  );
};

export default Donation;