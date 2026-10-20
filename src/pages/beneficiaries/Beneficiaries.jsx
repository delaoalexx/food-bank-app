import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Pagination, Skeleton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MainLayout from "../../components/layout/MainLayout";
import BeneficiaryStatCard from "../../components/beneficiaries/BeneficiaryStatCard";
import BeneficiaryCard from "../../components/beneficiaries/BeneficiaryCard";
import BeneficiaryForm from "../../components/beneficiaries/BeneficiaryForm";
import DeliveryForm from "../../components/beneficiaries/DeliveryForm";
import EmptyState from "../../components/common/EmptyState";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { getBeneficiarios } from "../../services/api";

const Beneficiaries = () => {
  const [open, setOpen] = useState(false);
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const fetchBeneficiarios = async () => {
    try {
      setLoading(true);
      const data = await getBeneficiarios();

      const mapped = data.map((b) => ({
        ...b,
        name: b.nombre,
        members: b.familia?.cantidad_miembros ?? 0,
        deliveries: b.entregas?.length ?? 0,
        history:
          b.entregas?.map((e) => ({
            date: new Date(e.fecha).toISOString().split("T")[0],
            items: [`${e.cantidad} ${e.producto?.unit || "kg"} ${e.producto?.nombre ?? "producto"}`],
          })) ?? [],
      }));

      setFamilias(mapped);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiarios();
  }, []);

  const totalPersonas = familias.reduce((acc, f) => acc + (f.members ?? 0), 0);
  const totalEntregas = familias.reduce((acc, f) => acc + (f.deliveries ?? 0), 0);

  const handleNuevaEntrega = (family) => {
    setFamiliaSeleccionada(family);
    setDeliveryOpen(true);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFamilias = familias.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(familias.length / itemsPerPage);

  return (
    <MainLayout>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
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
            Beneficiarios
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
            Registrar Familia
          </Button>
        </Box>

        {/* 2. STATS CARDS GRID */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: "24px",
            width: "100%",
          }}
        >
          <BeneficiaryStatCard
            value={familias.length}
            label="Familias registradas"
          />
          <BeneficiaryStatCard
            value={totalPersonas}
            label="Personas beneficiadas"
          />
          <BeneficiaryStatCard
            value={totalEntregas}
            label="Productos totales entregados"
          />
        </Box>

        {/* 3. FAMILIES LIST */}
        <Box sx={{ width: "100%", marginTop: 1 }}>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={80} sx={{ borderRadius: "12px" }} />
              ))}
            </Box>
          ) : familias.length === 0 ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <EmptyState
                icon={PeopleAltIcon}
                title="Sin beneficiarios registrados"
                description="Comienza registrando la primera familia beneficiaria."
              />
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                {currentFamilias.map((family) => (
                  <BeneficiaryCard
                    key={family.id}
                    family={family}
                    onNuevaEntrega={handleNuevaEntrega}
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

      {/* MODALES */}
      <BeneficiaryForm open={open} setOpen={setOpen} onSuccess={fetchBeneficiarios} />
      <DeliveryForm
        open={deliveryOpen}
        setOpen={setDeliveryOpen}
        family={familiaSeleccionada}
        onSuccess={fetchBeneficiarios}
      />
    </MainLayout>
  );
};

export default Beneficiaries;