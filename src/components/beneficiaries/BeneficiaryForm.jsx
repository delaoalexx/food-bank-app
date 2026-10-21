import React, { useState } from "react";
import {
  Dialog,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { createFamilia } from "../../services/api";

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

const BeneficiaryForm = ({ open, setOpen, onSuccess }) => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [miembros, setMiembros] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    if (loading) return;
    setNombre("");
    setTelefono("");
    setMiembros("");
    setDireccion("");
    setError(null);
    setErrors({});
    setOpen(false);
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!nombre.trim())
      newErrors.nombre = "El nombre de la familia es obligatorio.";
    if (!telefono.trim()) newErrors.telefono = "El teléfono es obligatorio.";
    else if (!/^\d{10}$/.test(telefono))
      newErrors.telefono = "Debe contener 10 dígitos.";
    if (!miembros || Number(miembros) <= 0)
      newErrors.miembros = "Debe ser mayor a 0.";
    if (!direccion.trim()) newErrors.direccion = "La dirección es obligatoria.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setError(null);
    setErrors({});

    try {
      const resultado = await createFamilia({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        cantidad_miembros: Number(miembros),
        direccion: direccion.trim(),
      });

      if (!resultado) {
        return setError("Error al registrar la familia.");
      }

      onSuccess?.();
      handleClose();
    } catch {
      setError("Error al registrar la familia.");
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
          Registrar nueva familia
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

        <TextField
          fullWidth
          label="Nombre de la familia / beneficiario"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setErrors((prev) => ({ ...prev, nombre: "" }));
          }}
          error={!!errors.nombre}
          helperText={errors.nombre}
          sx={textFieldStyle}
        />

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
            label="Número de teléfono"
            value={telefono}
            onChange={(e) => {
              setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10));
              setErrors((prev) => ({ ...prev, telefono: "" }));
            }}
            error={!!errors.telefono}
            helperText={errors.telefono}
            inputProps={{ maxLength: 10 }}
            sx={textFieldStyle}
          />

          <TextField
            fullWidth
            label="Cantidad de miembros"
            type="number"
            value={miembros}
            onChange={(e) => {
              setMiembros(e.target.value);
              setErrors((prev) => ({ ...prev, miembros: "" }));
            }}
            error={!!errors.miembros}
            helperText={errors.miembros}
            inputProps={{ min: 1 }}
            sx={textFieldStyle}
          />
        </Box>

        <TextField
          fullWidth
          label="Dirección / Ubicación"
          value={direccion}
          onChange={(e) => {
            setDireccion(e.target.value);
            setErrors((prev) => ({ ...prev, direccion: "" }));
          }}
          error={!!errors.direccion}
          helperText={errors.direccion}
          sx={textFieldStyle}
        />

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
            Registrar Familia
          </LoadingButton>
        </Box>
      </Box>
    </Dialog>
  );
};

export default BeneficiaryForm;