import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import DonationStatCard from "../../components/donations/DonationStatCard";
import DonationHistoryCard from "../../components/donations/DonationHistoryCard";
import DonationForm from "../../components/donations/DonationForm";
import {Box,Button,Typography,CircularProgress,Pagination,} from "@mui/material";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import { getDonaciones } from "../../services/api";

const Donation = () => {
  const [open, setOpen] = useState(false);
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchDonaciones = async () => {
    setLoading(true);

    const data = await getDonaciones();

    const mapped = data.map((d) => ({
      id: d.id,
      donor: d.donante,
      description: `${d.cantidad} ${d.producto?.unit || ""} ${
        d.producto?.nombre || "producto"
      }`.trim(),
      date: new Date(d.fecha).toLocaleDateString("es-MX"),
    }));

    setDonaciones(mapped);
    setCurrentPage(1);
    setLoading(false);
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
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{ padding: "40px", flex: 1, overflowY: "auto", height: "100vh" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <h1 style={{ fontSize: "48px", margin: 0 }}>Donaciones</h1>
          <Button
            variant="contained"
            color="warning"
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              paddingX: 3,
              paddingY: 1.5,
            }}
          >
            + Registrar donacion
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 3, marginBottom: 4 }}>
          <DonationStatCard
            icon={<CardGiftcardOutlinedIcon sx={{ color: "#e07a2f" }} />}
            value={donaciones.length}
            label="Donaciones registradas"
          />
          <DonationStatCard
            icon={<ApartmentOutlinedIcon sx={{ color: "#3b82f6" }} />}
            value={totalProductos}
            label="Productos recibidos"
          />
        </Box>

        <Box
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: 4,
            padding: "32px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Historial de donaciones
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                paddingY: 4,
              }}
            >
              <CircularProgress color="warning" />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {currentDonaciones.map((d) => (
                  <DonationHistoryCard
                    key={d.id}
                    donor={d.donor}
                    description={d.description}
                    date={d.date}
                  />
                ))}
              </Box>

              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 4,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, value) => setCurrentPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </div>
      <DonationForm open={open} setOpen={setOpen} onSuccess={fetchDonaciones} />
    </div>
  );
};

export default Donation;
