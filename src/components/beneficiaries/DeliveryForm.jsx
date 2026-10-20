import React, { useState, useEffect } from "react";
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

    // Limpiar errores individuales al escribir
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
      maxWidth="sm"
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
      {/* 1. MODAL HEADER */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "32px 40px 24px 24px",
          gap: "4px",
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
          Nueva entrega
        </Typography>
        <Typography sx={{ fontSize: "14px", color: "#737373" }}>
          {family?.nombre || family?.name}
        </Typography>
      </Box>

      {/* 2. MODAL FORM */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "0px 24px 32px 24px",
          gap: "20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ width: "100%", borderRadius: "12px" }}>
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

        <TextField
          fullWidth
          label="Fecha de entrega"
          value={new Date().toISOString().split("T")[0]}
          disabled
          sx={textFieldStyle}
        />

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <Typography
            sx={{ fontSize: "14px", fontWeight: 600, color: "#171717" }}
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
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Producto"
                  value={renglon.productoId}
                  onChange={(e) =>
                    handleChangeRenglon(index, "productoId", e.target.value)
                  }
                  error={!!prodError}
                  helperText={prodError}
                  sx={{ flex: 1, ...textFieldStyle }}
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
                  label="Cantidad"
                  value={renglon.cantidad}
                  onChange={(e) =>
                    handleChangeRenglon(index, "cantidad", e.target.value)
                  }
                  error={!!cantError}
                  helperText={cantError}
                  sx={{ width: "140px", ...textFieldStyle }}
                  inputProps={{ min: 1 }}
                />

                <IconButton
                  onClick={() => handleRemoveRenglon(index)}
                  disabled={renglones.length === 1}
                  sx={{ mt: 1, color: "#A3A3A3" }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            );
          })}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddRenglon}
            sx={{
              textTransform: "none",
              color: "#029739",
              fontWeight: 600,
              alignSelf: "flex-start",
            }}
          >
            Agregar otro producto
          </Button>
        </Box>

        {/* 3. BOTONES DE ACCIÓN */}
        <Box sx={{ display: "flex", gap: "16px", width: "100%", mt: 1 }}>
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
            Registrar Entrega
          </LoadingButton>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DeliveryForm;