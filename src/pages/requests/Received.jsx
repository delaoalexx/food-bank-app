import { useEffect, useState } from "react";
import RequestCard from "../../components/requests/RequestCard";
import EmptyState from "../../components/common/EmptyState";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import {
  Box,
  Typography,
  Pagination,
  Skeleton,
  Card,
  CardContent,
  Dialog,
  TextField,
  Button,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  getSolicitudesRecibidas,
  aprobarSolicitud,
  rechazarSolicitud,
} from "../../services/api";

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

const Received = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openReject, setOpenReject] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [rechazando, setRechazando] = useState(false);

  const itemsPerPage = 5;

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const data = await getSolicitudesRecibidas();
      setSolicitudes(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAprobar = async (id, origen) => {
    try {
      await aprobarSolicitud(id, origen);
      fetchData();
    } catch (error) {
      console.error("Error aprobando:", error);
    }
  };

  const handleRechazar = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMotivo("");
    setOpenReject(true);
  };

  const handleModalClose = () => {
    setOpenReject(false);
    setSolicitudSeleccionada(null);
    setMotivo("");
  };

  const confirmarRechazo = async () => {
    if (!motivo.trim() || rechazando) return;

    setRechazando(true);
    try {
      await rechazarSolicitud(
        solicitudSeleccionada.transferencia_id,
        solicitudSeleccionada.origen,
        motivo,
      );
      handleModalClose();
      fetchData();
    } catch (error) {
      console.error("Error rechazando:", error);
    } finally {
      setRechazando(false);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSolicitudes = solicitudes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(solicitudes.length / itemsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[1, 2, 3].map((item) => (
          <Card
            key={item}
            sx={{
              borderRadius: "12px",
              boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
              border: "1px solid #E7E5E4",
            }}
          >
            <CardContent>
              <Skeleton width="35%" height={25} />
              <Box sx={{ mt: 2 }}>
                <Skeleton width="70%" height={45} />
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
              >
                <Skeleton width={120} height={25} />
                <Skeleton width={180} height={40} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          minHeight: "calc(100vh - 220px)",
        }}
      >
        {solicitudes.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              width: "100%",
              py: 8,
            }}
          >
            <EmptyState
              icon={CheckCircleOutlinedIcon}
              title="Todo al día"
              description="No tienes solicitudes pendientes por responder."
              sx={{
                "& .MuiSvgIcon-root": { fontSize: 64, color: "#A3A3A3" },
                "& .MuiTypography-h6": {
                  fontSize: "20px",
                  fontWeight: 700,
                  mt: 2,
                },
                "& .MuiTypography-body2": {
                  fontSize: "15px",
                  color: "#737373",
                  maxWidth: "380px",
                },
              }}
            />
          </Box>
        ) : (
          <>
            {currentSolicitudes.map((s) => (
              <RequestCard
                key={s.transferencia_id || s.id}
                solicitud={s}
                type="received"
                onAprobar={() => handleAprobar(s.transferencia_id, s.origen)}
                onRechazar={() => handleRechazar(s)}
              />
            ))}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
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

      {/* MODAL DE RECHAZO (HOMOLOGADO A ADDPRODUCTMODAL) */}
      <Dialog
        open={openReject}
        onClose={rechazando ? undefined : handleModalClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            width: "100%",
            maxWidth: "576px",
            margin: "16px",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          },
        }}
      >
        {/* MODAL HEADER */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "32px 40px 24px 24px",
            gap: "8px",
            boxSizing: "border-box",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "24px",
              color: "#171717",
              lineHeight: 1.2,
            }}
          >
            Rechazar solicitud
          </Typography>
        </Box>

        {/* MODAL FORM */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "0px 24px 32px 24px",
            gap: 2,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Escribe el motivo del rechazo para la sucursal solicitante.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ejemplo: Tenemos alta demanda de frijol y bajo stock"
            sx={textFieldStyle}
          />

          {/* BOTONES DE ACCIÓN */}
          <Box
            sx={{
              display: "flex",
              gap: "16px",
              width: "100%",
              marginTop: 1,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={handleModalClose}
              disabled={rechazando}
              sx={{
                borderRadius: "12px",
                paddingY: 1.2,
                textTransform: "none",
                fontWeight: 400,
                borderColor: "#E7E5E4",
                color: "#44403C",
                "&:hover": {
                  borderColor: "#A8A29E",
                  backgroundColor: "#F5F5F4",
                },
              }}
            >
              Cancelar
            </Button>

            <LoadingButton
              fullWidth
              variant="contained"
              color="error"
              loading={rechazando}
              disabled={!motivo.trim() || rechazando}
              onClick={confirmarRechazo}
              sx={{
                borderRadius: "12px",
                paddingY: 1.2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              Rechazar
            </LoadingButton>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default Received;
