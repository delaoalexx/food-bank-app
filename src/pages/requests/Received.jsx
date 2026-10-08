import { useEffect, useState } from "react";
import RequestCard from "../../components/requests/RequestCard";
import {Box,Typography,Pagination,Skeleton,Card,CardContent,Dialog,DialogContent,TextField,Button,} from "@mui/material";
import {getSolicitudesRecibidas,aprobarSolicitud,rechazarSolicitud,} from "../../services/api";

const Received = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openReject, setOpenReject] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

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

  const confirmarRechazo = async () => {
    try {
      await rechazarSolicitud(
        solicitudSeleccionada.transferencia_id,
        solicitudSeleccionada.origen,
        motivo,
      );
      setOpenReject(false);
      setSolicitudSeleccionada(null);
      setMotivo("");
      fetchData();
    } catch (error) {
      console.error("Error rechazando:", error);
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
      <Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[1, 2, 3].map((item) => (
            <Card key={item} sx={{ borderRadius: 4, boxShadow: 2 }}>
              <CardContent>
                <Skeleton width="35%" height={25} />
                <Box sx={{ mt: 2 }}>
                  <Skeleton width="70%" height={45} />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                  }}
                >
                  <Skeleton width={120} height={25} />
                  <Skeleton width={180} height={40} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {solicitudes.length === 0 ? (
          <Typography color="text.secondary">
            No hay solicitudes recibidas.
          </Typography>
        ) : (
          <>
            {currentSolicitudes.map((s) => {
              return (
                <RequestCard
                  key={s.transferencia_id || s.id}
                  solicitud={s}
                  type="received"
                  onAprobar={() => handleAprobar(s.transferencia_id, s.origen)}
                  onRechazar={() => handleRechazar(s)}
                />
              );
            })}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, value) => setCurrentPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      <Dialog
        open={openReject}
        onClose={() => setOpenReject(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "30px" } }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Rechazar solicitud
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Escribe el motivo del rechazo.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ejemplo: No hay stock suficiente"
          />
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenReject(false)}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              disabled={!motivo.trim()}
              onClick={confirmarRechazo}
            >
              Rechazar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Received;
