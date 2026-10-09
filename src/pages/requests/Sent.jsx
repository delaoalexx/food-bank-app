import { useState, useEffect } from "react";
import RequestCard from "../../components/requests/RequestCard";
import EmptyState from "../../components/common/EmptyState";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import {
  Box,
  Button,
  Typography,
  Dialog,
  TextField,
  MenuItem,
  Pagination,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  CURRENT_NODE,
  getSolicitudesEnviadas,
  getBranchProducts,
  createSolicitud,
} from "../../services/api";

const SUCURSALES = [
  { key: "comondu", label: "Comondú" },
  { key: "lapaz", label: "La Paz" },
  { key: "loreto", label: "Loreto" },
  { key: "mulege", label: "Mulegé" },
];

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

const Sent = ({ open, setOpen }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [productosSucursal, setProductosSucursal] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [sucursal, setSucursal] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchSolicitudes = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const data = await getSolicitudesEnviadas();
      setSolicitudes(data);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
    const interval = setInterval(() => fetchSolicitudes(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSucursalChange = async (e) => {
    const valor = e.target.value;
    setSucursal(valor);
    setProductoId("");
    setLoadingProductos(true);

    try {
      const data = await getBranchProducts(valor);
      setProductosSucursal(data.productos || data);
    } catch (error) {
      console.error(error);
      setProductosSucursal([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  const handleModalClose = () => {
    setOpen(false);
    setSucursal("");
    setProductoId("");
    setCantidad("");
    setErrors({});
  };

  const handleEnviar = async () => {
    const newErrors = {};

    if (!sucursal) {
      newErrors.sucursal = "Selecciona una sucursal";
    }

    if (!productoId) {
      newErrors.producto = "Selecciona un producto";
    }

    if (!cantidad) {
      newErrors.cantidad = "Ingresa una cantidad";
    } else if (Number(cantidad) <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0";
    } else if (!Number.isInteger(Number(cantidad))) {
      newErrors.cantidad = "Solo se permiten números enteros";
    }

    const productoElegido = productosSucursal.find(
      (p) => p.id === Number(productoId),
    );

    if (productoElegido && Number(cantidad) > productoElegido.cantidad) {
      newErrors.cantidad = `Solo hay ${productoElegido.cantidad} ${productoElegido.unit} disponibles`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setEnviando(true);

    try {
      await createSolicitud({
        origen: sucursal,
        producto_nombre: productoElegido.nombre,
        cantidad: Number(cantidad),
      });

      handleModalClose();
      fetchSolicitudes();
    } catch (e) {
      console.error(e);
    } finally {
      setEnviando(false);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSolicitudes = solicitudes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(solicitudes.length / itemsPerPage);

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
        {loading ? (
          [1, 2, 3].map((item) => (
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
          ))
        ) : solicitudes.length === 0 ? (
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
              icon={CancelScheduleSendIcon}
              title="Sin solicitudes enviadas"
              description="Aún no has solicitado productos a otras sucursales."
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
                type="sent"
                showActions={false}
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

      {/* MODAL NUEVA SOLICITUD (HOMOLOGADO A ADDPRODUCTMODAL) */}
      <Dialog
        open={open}
        onClose={enviando ? undefined : handleModalClose}
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
            Nueva solicitud
          </Typography>
        </Box>

        {/* MODAL FORM */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "0px 24px 32px 24px",
            gap: "24px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <TextField
            select
            fullWidth
            label="Sucursal destino"
            value={sucursal}
            onChange={(e) => {
              handleSucursalChange(e);
              setErrors((prev) => ({ ...prev, sucursal: "" }));
            }}
            error={!!errors.sucursal}
            helperText={errors.sucursal}
            sx={textFieldStyle}
          >
            {SUCURSALES.filter((s) => s.key !== CURRENT_NODE).map((s) => (
              <MenuItem key={s.key} value={s.key}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: "16px",
              width: "100%",
            }}
          >
            <TextField
              select
              fullWidth
              label="Producto"
              value={productoId}
              onChange={(e) => {
                setProductoId(e.target.value);
                setErrors((prev) => ({ ...prev, producto: "" }));
              }}
              error={!!errors.producto}
              helperText={errors.producto}
              disabled={loadingProductos || !sucursal}
              sx={textFieldStyle}
            >
              {loadingProductos ? (
                <MenuItem disabled>Cargando...</MenuItem>
              ) : (
                productosSucursal.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre} ({p.cantidad} {p.unit})
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              type="number"
              fullWidth
              label="Cantidad"
              value={cantidad}
              onChange={(e) => {
                setCantidad(e.target.value);
                setErrors((prev) => ({ ...prev, cantidad: "" }));
              }}
              error={!!errors.cantidad}
              helperText={errors.cantidad}
              inputProps={{ min: 1 }}
              sx={textFieldStyle}
            />
          </Box>

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
              disabled={enviando}
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
              loading={enviando}
              disabled={enviando}
              onClick={handleEnviar}
              sx={{
                borderRadius: "12px",
                paddingY: 1.2,
                textTransform: "none",
                fontWeight: 600,
                backgroundColor: "#029739",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#15803d",
                  boxShadow: "none",
                },
              }}
            >
              Enviar solicitud
            </LoadingButton>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default Sent;
