import { useState, useEffect } from "react";
import {
  Dialog,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { getCategories, createDonacion } from "../../services/api";

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

const DonationForm = ({ open, setOpen, onSuccess }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    donante_nombre: "",
    producto_nombre: "",
    categoria_id: "",
    cantidad: "",
    unit: "",
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    setErrors({});
    getCategories()
      .then(setCategorias)
      .catch(() => setError("Error al cargar categorías."));
  }, [open]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setError(null);
    setSuccess(false);
    setErrors({});
    setForm({
      donante_nombre: "",
      producto_nombre: "",
      categoria_id: "",
      cantidad: "",
      unit: "",
    });
  };

  const handleSubmit = async () => {
    if (loading) return;

    const newErrors = {};

    if (!form.donante_nombre.trim()) {
      newErrors.donante_nombre = "Ingresa el nombre del donante";
    }

    if (!form.producto_nombre.trim()) {
      newErrors.producto_nombre = "Ingresa el nombre del producto";
    }

    if (!form.categoria_id) {
      newErrors.categoria_id = "Selecciona una categoría";
    }

    if (!form.cantidad) {
      newErrors.cantidad = "Ingresa una cantidad";
    } else if (Number(form.cantidad) <= 0) {
      newErrors.cantidad = "Debe ser mayor a 0";
    } else if (!Number.isInteger(Number(form.cantidad))) {
      newErrors.cantidad = "Solo números enteros";
    }

    if (!form.unit) {
      newErrors.unit = "Selecciona una unidad";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await createDonacion({
        donante: form.donante_nombre.trim(),
        producto: form.producto_nombre.trim(),
        cantidad: Number(form.cantidad),
        unit: form.unit,
        categoria_id: Number(form.categoria_id),
      });

      setSuccess(true);
      onSuccess?.();
      setTimeout(handleClose, 800);
    } catch {
      setError("Error al registrar la donación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
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
          Registrar donación
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
            ¡Donación registrada!
          </Alert>
        )}

        <TextField
          fullWidth
          label="Donante"
          name="donante_nombre"
          value={form.donante_nombre}
          onChange={(e) => {
            handleChange(e);
            setErrors((prev) => ({ ...prev, donante_nombre: "" }));
          }}
          error={!!errors.donante_nombre}
          helperText={errors.donante_nombre}
          sx={textFieldStyle}
        />

        <TextField
          fullWidth
          label="Producto"
          placeholder="Alimento/producto"
          name="producto_nombre"
          value={form.producto_nombre}
          onChange={(e) => {
            handleChange(e);
            setErrors((prev) => ({ ...prev, producto_nombre: "" }));
          }}
          error={!!errors.producto_nombre}
          helperText={errors.producto_nombre}
          sx={textFieldStyle}
        />

        <TextField
          fullWidth
          select
          label="Categoría"
          name="categoria_id"
          value={form.categoria_id}
          onChange={(e) => {
            handleChange(e);
            setErrors((prev) => ({ ...prev, categoria_id: "" }));
          }}
          error={!!errors.categoria_id}
          helperText={errors.categoria_id}
          sx={textFieldStyle}
        >
          {categorias.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.nombre}
            </MenuItem>
          ))}
        </TextField>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            width: "100%",
          }}
        >
          <TextField
            fullWidth
            label="Cantidad"
            type="number"
            name="cantidad"
            value={form.cantidad}
            onChange={(e) => {
              handleChange(e);
              setErrors((prev) => ({ ...prev, cantidad: "" }));
            }}
            error={!!errors.cantidad}
            helperText={errors.cantidad}
            inputProps={{ min: 1 }}
            sx={textFieldStyle}
          />

          <TextField
            fullWidth
            select
            label="Unidad"
            name="unit"
            value={form.unit}
            onChange={(e) => {
              handleChange(e);
              setErrors((prev) => ({ ...prev, unit: "" }));
            }}
            error={!!errors.unit}
            helperText={errors.unit}
            sx={textFieldStyle}
          >
            <MenuItem value="pz">Pz</MenuItem>
            <MenuItem value="kg">Kg</MenuItem>
            <MenuItem value="gr">Gramos</MenuItem>
            <MenuItem value="L">Litros</MenuItem>
            <MenuItem value="ml">Mililitros</MenuItem>
          </TextField>
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
            Registrar donación
          </LoadingButton>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DonationForm;