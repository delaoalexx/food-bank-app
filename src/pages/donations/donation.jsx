import React, { useState, useEffect, useMemo } from "react";
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
  const [rawDonaciones, setRawDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchDonaciones = async () => {
    setLoading(true);
    try {
      const data = await getDonaciones();
      setRawDonaciones(data || []);
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

  // AGRUPACIÓN POR DONANTE Y FECHA
  const donacionesAgrupadas = useMemo(() => {
    const VENTANA_MS = 10000; // 10 segundos
    const grupos = [];

    [...rawDonaciones]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .forEach((d) => {
        const fechaStr = new Date(d.fecha).toISOString().split("T")[0];
        const tiempo = new Date(d.fecha).getTime();
        const donante = d.donante || "Desconocido";

        let grupo = grupos.find(
          (g) =>
            g.donor === donante &&
            g.date === fechaStr &&
            Math.abs(g.tiempo - tiempo) <= VENTANA_MS,
        );

        if (!grupo) {
          grupo = {
            id: `${donante}_${d.fecha}_${d.id}`,
            donor: donante,
            date: fechaStr,
            tiempo,
            items: [],
          };
          grupos.push(grupo);
        }

        grupo.items.push({
          nombre: d.producto?.nombre || "Producto",
          cantidad: d.cantidad,
          unit: d.producto?.unit || "pz",
        });
      });

    return grupos;
  }, [rawDonaciones]);

  const totalProductos = rawDonaciones.reduce(
    (acc, d) => acc + (Number(d.cantidad) || 0),
    0,
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDonaciones = donacionesAgrupadas.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(donacionesAgrupadas.length / itemsPerPage);

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
        {/* HEADER */}
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

        {/* STATS & CHART */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "264px 1fr" },
            gap: "32px",
            alignItems: "stretch",
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <DonationStatCard
              value={donacionesAgrupadas.length}
              label="Donaciones totales"
            />
            <DonationStatCard
              value={totalProductos}
              label="Productos recibidos"
            />
          </Box>

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
                    categoryGapRatio: 0.65,
                  },
                ]}
                series={[{ data: chartData, color: "#029739" }]}
                height={210}
                margin={{ top: 15, bottom: 25, left: 25, right: 10 }}
              />
            </Box>
          </Box>
        </Box>

        {/* HISTORIAL */}
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
          ) : donacionesAgrupadas.length === 0 ? (
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
                    items={d.items}
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

      <DonationForm open={open} setOpen={setOpen} onSuccess={fetchDonaciones} />
    </MainLayout>
  );
};

export default Donation;
