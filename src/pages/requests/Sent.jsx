import { useState, useEffect } from "react";
import RequestCard from "../../components/requests/RequestCard";
import {Box,Button,Typography,Dialog,DialogContent,TextField,MenuItem,Pagination,Skeleton,Card,CardContent,} from "@mui/material";
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
    const interval = setInterval(() => fetchSolicitudes(false), 10000); // cada 10s
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

  //   const handleEnviar = async () => {
  //   if (!sucursal || !productoId || !cantidad) return;

  //   setEnviando(true);

  //   try {
  //     const productoElegido = productosSucursal.find(
  //       (p) => p.id === Number(productoId)
  //     );

  //     if (!productoElegido) {
  //       alert("Producto no encontrado");
  //       return;
  //     }

  //     await createSolicitud({
  //       origen: sucursal,
  //       producto_nombre: productoElegido.nombre,
  //       cantidad: Number(cantidad),
  //     });

  //     setOpen(false);
  //     setSucursal("");
  //     setProductoId("");
  //     setCantidad("");

  //     fetchSolicitudes();
  //   } catch (e) {
  //     console.error("Error enviando solicitud:", e);
  //   } finally {
  //     setEnviando(false);
  //   }
  // };

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

      setOpen(false);
      setSucursal("");
      setProductoId("");
      setCantidad("");
      setErrors({});

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
          gap: 3,
          marginBottom: 8,
        }}
      >
        {loading ? (
          [1, 2, 3].map((item) => (
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
          ))
        ) : solicitudes.length === 0 ? (
          <Typography color="text.secondary">
            No hay solicitudes enviadas.
          </Typography>
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
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "40px" } }}
      >
        <DialogContent sx={{ padding: "40px" }}>
          <Typography variant="h4" fontWeight="bold" mb={1}>
            Nueva solicitud
          </Typography>

          <Typography color="text.secondary" mb={4}>
            Completa la información para solicitar productos de otra sucursal.
          </Typography>

          <Typography variant="subtitle2" mb={1}>
            Sucursal destino
          </Typography>

          <TextField
            select
            fullWidth
            value={sucursal}
            onChange={(e) => {
              handleSucursalChange(e);

              setErrors((prev) => ({
                ...prev,
                sucursal: "",
              }));
            }}
            error={!!errors.sucursal}
            helperText={errors.sucursal}
            sx={{ marginBottom: 3 }}
          >
            {SUCURSALES.filter((s) => s.key !== CURRENT_NODE).map((s) => (
              <MenuItem key={s.key} value={s.key}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" mb={1}>
                Producto
              </Typography>

              <TextField
                select
                fullWidth
                value={productoId}
                onChange={(e) => {
                  setProductoId(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    producto: "",
                  }));
                }}
                error={!!errors.producto}
                helperText={errors.producto}
                disabled={loadingProductos || !sucursal}
              >
                {loadingProductos ? (
                  <MenuItem disabled>Cargando...</MenuItem>
                ) : (
                  productosSucursal.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nombre} — {p.cantidad} {p.unit} disponibles
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Box>

            <Box sx={{ width: "180px" }}>
              <Typography variant="subtitle2" mb={1}>
                Cantidad
              </Typography>

              <TextField
                type="number"
                fullWidth
                value={cantidad}
                onChange={(e) => {
                  setCantidad(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    cantidad: "",
                  }));
                }}
                error={!!errors.cantidad}
                helperText={errors.cantidad}
                inputProps={{ min: 1 }}
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpen(false)}
              sx={{ borderRadius: 3, textTransform: "none", paddingY: 1.5 }}
            >
              Cancelar
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="warning"
              onClick={handleEnviar}
              disabled={enviando || !sucursal || !productoId || !cantidad}
              sx={{ borderRadius: 3, textTransform: "none", paddingY: 1.5 }}
            >
              {enviando ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sent;
