import { useState, useEffect, useRef } from "react";
import RequestCard from "../../components/requests/RequestCard";
import EmptyState from "../../components/common/EmptyState";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  TextField,
  MenuItem,
  Pagination,
  Skeleton,
  Card,
  CardContent,
  Alert,
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

const rowFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
  },
};

const errorKeys = {
  productoId: "producto",
  cantidad: "cantidad",
};

const Sent = ({ open, setOpen }) => {
  const nextId = useRef(1);
  const newProducto = () => ({
    id: nextId.current++,
    productoId: "",
    cantidad: "",
  });

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [productosSucursal, setProductosSucursal] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [sucursal, setSucursal] = useState("");
  const [productos, setProductos] = useState(() => [newProducto()]);
  const [focusId, setFocusId] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);

  const listEndRef = useRef(null);
  const prevCount = useRef(1);

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

  useEffect(() => {
    if (productos.length > prevCount.current) {
      listEndRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
    prevCount.current = productos.length;
  }, [productos.length]);

  const handleSucursalChange = async (e) => {
    const valor = e.target.value;
    setSucursal(valor);
    setProductos((prev) => prev.map((p) => ({ ...p, productoId: "" })));
    setErrors((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([key]) => !key.startsWith("producto_")),
      ),
    );
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

  const handleAddProducto = () => {
    const nuevo = newProducto();
    setProductos((prev) => [...prev, nuevo]);
    setFocusId(nuevo.id);
  };

  const handleRemoveProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[`producto_${id}`];
      delete copy[`cantidad_${id}`];
      return copy;
    });
  };

  const handleChangeProducto = (id, field, value) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
    setErrors((prev) => ({ ...prev, [`${errorKeys[field]}_${id}`]: "" }));
  };

  const handleCantidadKeyDown = (e, prod) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (prod.productoId && prod.cantidad) {
      handleAddProducto();
    }
  };

  const handleModalClose = () => {
    setOpen(false);
    setSucursal("");
    setProductos([newProducto()]);
    setFocusId(null);
    setErrors({});
    setError(null);
  };

  const handleEnviar = async () => {
    if (enviando) return;

    const newErrors = {};

    if (!sucursal) {
      newErrors.sucursal = "Selecciona una sucursal";
    }

    productos.forEach((p) => {
      if (!p.productoId) {
        newErrors[`producto_${p.id}`] = "Selecciona un producto";
      }

      if (!p.cantidad) {
        newErrors[`cantidad_${p.id}`] = "Ingresa una cantidad";
      } else if (Number(p.cantidad) <= 0) {
        newErrors[`cantidad_${p.id}`] = "Debe ser mayor a 0";
      } else if (!Number.isInteger(Number(p.cantidad))) {
        newErrors[`cantidad_${p.id}`] = "Solo números enteros";
      }

      const productoElegido = productosSucursal.find(
        (x) => x.id === Number(p.productoId),
      );

      if (productoElegido && Number(p.cantidad) > productoElegido.cantidad) {
        newErrors[`cantidad_${p.id}`] =
          `Solo hay ${productoElegido.cantidad} ${productoElegido.unit} disponibles`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setError(null);
    setEnviando(true);

    try {
      const results = await Promise.allSettled(
        productos.map((p) => {
          const productoElegido = productosSucursal.find(
            (x) => x.id === Number(p.productoId),
          );

          return createSolicitud({
            origen: sucursal,
            producto_nombre: productoElegido.nombre,
            cantidad: Number(p.cantidad),
          });
        }),
      );

      const fallidos = productos.filter(
        (_, i) => results[i].status === "rejected",
      );

      if (fallidos.length < productos.length) {
        fetchSolicitudes();
      }

      if (fallidos.length === 0) {
        handleModalClose();
      } else {
        setProductos(fallidos);
        setError(
          `No se pudieron enviar ${fallidos.length} de ${productos.length} productos. Los demás ya se enviaron; revisa los que siguen en la lista y vuelve a intentar.`,
        );
      }
    } catch (e) {
      console.error(e);
      setError("Error al enviar la solicitud.");
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
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            width: "100%",
            maxWidth: "680px",
            margin: "16px",
            maxHeight: "calc(100% - 32px)",
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

        {error && (
          <Box
            sx={{
              padding: "0px 24px 16px 24px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Alert
              severity="error"
              sx={{ width: "100%", borderRadius: "12px" }}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* MODAL FORM */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "8px 24px 16px 24px",
            width: "100%",
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
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
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: "2px",
              }}
            ></Box>

            {productos.map((prod, index) => (
              <Box
                key={prod.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr 40px",
                    sm: "28px 2fr 1fr 40px",
                  },
                  gap: "8px",
                  alignItems: "flex-start",
                  width: "100%",
                  boxSizing: "border-box",
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #E7E5E4",
                  borderRadius: "12px",
                  padding: "10px",
                  animation: "rowIn 0.18s ease-out",
                  "@keyframes rowIn": {
                    from: { opacity: 0, transform: "translateY(-6px)" },
                    to: { opacity: 1, transform: "none" },
                  },
                }}
              >
                <Typography
                  sx={{
                    display: { xs: "none", sm: "block" },
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#737373",
                    mt: "9px",
                  }}
                >
                  {index + 1}
                </Typography>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Producto"
                  value={prod.productoId}
                  onChange={(e) =>
                    handleChangeProducto(prod.id, "productoId", e.target.value)
                  }
                  error={!!errors[`producto_${prod.id}`]}
                  helperText={errors[`producto_${prod.id}`]}
                  disabled={loadingProductos || !sucursal}
                  sx={{
                    ...rowFieldStyle,
                    gridColumn: { xs: "1 / 3", sm: "auto" },
                  }}
                >
                  {loadingProductos ? (
                    <MenuItem disabled>Cargando...</MenuItem>
                  ) : (
                    productosSucursal.map((p) => (
                      <MenuItem
                        key={p.id}
                        value={p.id}
                        disabled={productos.some(
                          (x) => x.id !== prod.id && x.productoId === p.id,
                        )}
                      >
                        {p.nombre} ({p.cantidad} {p.unit})
                      </MenuItem>
                    ))
                  )}
                </TextField>

                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  autoFocus={prod.id === focusId}
                  label="Cantidad"
                  value={prod.cantidad}
                  onChange={(e) =>
                    handleChangeProducto(prod.id, "cantidad", e.target.value)
                  }
                  onKeyDown={(e) => handleCantidadKeyDown(e, prod)}
                  error={!!errors[`cantidad_${prod.id}`]}
                  helperText={errors[`cantidad_${prod.id}`]}
                  inputProps={{ min: 1 }}
                  sx={{
                    ...rowFieldStyle,
                    gridColumn: { xs: "1 / -1", sm: "auto" },
                    gridRow: { xs: 2, sm: "auto" },
                  }}
                />

                <IconButton
                  aria-label="Quitar producto"
                  onClick={() => handleRemoveProducto(prod.id)}
                  disabled={productos.length === 1}
                  sx={{
                    color: "#A3A3A3",
                    borderRadius: "10px",
                    gridColumn: { xs: 3, sm: "auto" },
                    gridRow: { xs: 1, sm: "auto" },
                    "&:hover": {
                      backgroundColor: "#E8F6ED",
                      color: "#C62828",
                    },
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddProducto}
              sx={{
                textTransform: "none",
                color: "#029739",
                fontWeight: 600,
                border: "1.5px dashed #029739",
                borderRadius: "12px",
                paddingY: "13px",
                mt: "2px",
                "&:hover": {
                  backgroundColor: "#E8F6ED",
                  border: "1.5px dashed #029739",
                },
              }}
            >
              Agregar otro producto
            </Button>

            <div ref={listEndRef} />
          </Box>
        </Box>

        {/* BOTONES DE ACCIÓN */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            width: "100%",
            padding: "16px 24px 24px 24px",
            boxSizing: "border-box",
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
            {productos.length > 1
              ? `Enviar solicitud (${productos.length})`
              : "Enviar solicitud"}
          </LoadingButton>
        </Box>
      </Dialog>
    </>
  );
};

export default Sent;
