import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  Typography,
  Box,
  TextField,
  MenuItem,
  IconButton,
  Button,
  Alert,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import { getProducts, createEntrega } from "../../services/api";

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
  "& .MuiInputLabel-root.Mui-disabled": {
    color: "#404040",
    fontWeight: 500,
  },
  "& .MuiOutlinedInput-input.Mui-disabled": {
    WebkitTextFillColor: "#171717",
  },
};

const rowFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
  },
};

const DeliveryForm = ({ open, setOpen, family, onSuccess }) => {
  const [renglones, setRenglones] = useState([
    { productoId: "", cantidad: "" },
  ]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const listEndRef = useRef(null);
  const prevCount = useRef(1);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    setErrors({});
    getProducts().then((data) => {
      const mapped = data.map((p) => ({
        id: p.id,
        name: p.nombre,
        stock: p.cantidad,
        unit: p.unit || "pz",
      }));
      setProductos(mapped);
    });
  }, [open]);

  useEffect(() => {
    if (renglones.length > prevCount.current) {
      listEndRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
    prevCount.current = renglones.length;
  }, [renglones.length]);

  const handleAddRenglon = () => {
    setRenglones([...renglones, { productoId: "", cantidad: "" }]);
  };

  const handleRemoveRenglon = (index) => {
    setRenglones(renglones.filter((_, i) => i !== index));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[`prod_${index}`];
      delete copy[`cant_${index}`];
      return copy;
    });
  };

  const handleChangeRenglon = (index, field, value) => {
    const updated = [...renglones];
    updated[index][field] = value;
    setRenglones(updated);

    setErrors((prev) => ({
      ...prev,
      [`${field === "productoId" ? "prod" : "cant"}_${index}`]: "",
    }));
  };

  const productosUsados = renglones.map((r) => r.productoId).filter(Boolean);
  const getProducto = (id) => productos.find((p) => p.id === Number(id));

  const handleClose = () => {
    if (loading) return;
    setRenglones([{ productoId: "", cantidad: "" }]);
    setError(null);
    setSuccess(false);
    setErrors({});
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!family?.id) return setError("No hay familia seleccionada.");
    if (productos.length === 0)
      return setError("No hay productos disponibles.");

    const newErrors = {};

    renglones.forEach((r, idx) => {
      if (!r.productoId) {
        newErrors[`prod_${idx}`] = "Selecciona un producto";
      }

      if (!r.cantidad) {
        newErrors[`cant_${idx}`] = "Ingresa cantidad";
      } else if (isNaN(Number(r.cantidad)) || Number(r.cantidad) <= 0) {
        newErrors[`cant_${idx}`] = "La cantidad debe ser mayor a 0";
      } else {
        const producto = getProducto(r.productoId);
        if (producto && Number(r.cantidad) > producto.stock) {
          newErrors[`cant_${idx}`] = `Excede stock (${producto.stock})`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setError(null);

    try {
      const resultados = await Promise.all(
        renglones.map((r) =>
          createEntrega({
            beneficiario_id: family.id,
            producto_id: Number(r.productoId),
            cantidad: Number(r.cantidad),
          }),
        ),
      );

      if (resultados.some((r) => r === null))
        return setError("Error al registrar la entrega.");

      setSuccess(true);
      onSuccess?.();
      setTimeout(handleClose, 800);
    } catch {
      setError("Error al registrar la entrega.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
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
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* 1. MODAL HEADER (FIJO) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "32px 40px 16px 24px",
          boxSizing: "border-box",
          flexShrink: 0,
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
          Nueva entrega
        </Typography>
      </Box>

      {/* 2. MODAL FORM (CON SCROLL INTERNO) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "8px 24px 24px 24px",
          gap: 2,
          width: "100%",
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {(error || success) && (
          <Box sx={{ width: "100%" }}>
            {error && (
              <Alert
                severity="error"
                sx={{ width: "100%", borderRadius: "12px" }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                severity="success"
                sx={{ width: "100%", borderRadius: "12px" }}
              >
                ¡Entrega registrada!
              </Alert>
            )}
          </Box>
        )}

        <TextField
          fullWidth
          label="Familia / Beneficiario"
          value={family?.nombre || family?.name || "Sin beneficiario"}
          disabled
          InputLabelProps={{ shrink: true }}
          sx={textFieldStyle}
        />

        {/* CAMPO FECHA DE ENTREGA (READ-ONLY CON LABEL VISIBLE) */}
        <TextField
          fullWidth
          label="Fecha de entrega"
          value={new Date().toISOString().split("T")[0]}
          disabled
          InputLabelProps={{ shrink: true }}
          sx={textFieldStyle}
        />

        {/* SECCIÓN PRODUCTOS */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 0.5,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: "16px", color: "#171717" }}
          >
            Productos
          </Typography>

          {renglones.map((renglon, index) => {
            const prodError = errors[`prod_${index}`];
            const cantError = errors[`cant_${index}`];

            return (
              <Box
                key={index}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr 40px",
                    sm: "28px 2fr 1fr 40px",
                  },
                  gap: "12px",
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
                  value={renglon.productoId}
                  onChange={(e) =>
                    handleChangeRenglon(index, "productoId", e.target.value)
                  }
                  error={!!prodError}
                  helperText={prodError}
                  sx={{
                    ...rowFieldStyle,
                    gridColumn: { xs: "1 / 3", sm: "auto" },
                  }}
                >
                  {productos.map((p) => (
                    <MenuItem
                      key={p.id}
                      value={p.id}
                      disabled={
                        productosUsados.includes(p.id) &&
                        renglon.productoId !== p.id
                      }
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <span>{p.name}</span>
                        <Typography
                          component="span"
                          fontSize="12px"
                          color="text.secondary"
                        >
                          Disp: {p.stock} {p.unit}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  label="Cantidad"
                  value={renglon.cantidad}
                  onChange={(e) =>
                    handleChangeRenglon(index, "cantidad", e.target.value)
                  }
                  error={!!cantError}
                  helperText={cantError}
                  sx={{
                    ...rowFieldStyle,
                    gridColumn: { xs: "1 / -1", sm: "auto" },
                    gridRow: { xs: 2, sm: "auto" },
                  }}
                  inputProps={{ min: 1 }}
                />

                <IconButton
                  aria-label="Quitar producto"
                  onClick={() => handleRemoveRenglon(index)}
                  disabled={renglones.length === 1}
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
            );
          })}

          <Button
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleAddRenglon}
            sx={{
              textTransform: "none",
              color: "#029739",
              fontWeight: 600,
              border: "1.5px dashed #029739",
              borderRadius: "12px",
              paddingY: "12px",
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

      {/* 3. BOTONES DE ACCIÓN (FIJO AL PIE CON BORDE SUPERIOR) */}
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          width: "100%",
          padding: "16px 24px 24px 24px",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
          sx={{
            borderRadius: "12px",
            paddingY: 1.2,
            textTransform: "none",
            fontWeight: 400,
            borderColor: "#E7E5E4",
            color: "#44403C",
          }}
        >
          Cancelar
        </Button>

        <LoadingButton
          fullWidth
          variant="contained"
          loading={loading}
          disabled={loading}
          onClick={handleSubmit}
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
          {renglones.length > 1
            ? `Registrar Entrega (${renglones.length})`
            : "Registrar Entrega"}
        </LoadingButton>
      </Box>
    </Dialog>
  );
};

export default DeliveryForm;
