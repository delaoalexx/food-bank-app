import { useState } from "react";
import {Box,Button,Typography,Dialog,DialogContent,TextField,CircularProgress,Alert,} from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { createFamilia } from "../../services/api";

const BeneficiaryForm = ({ open, setOpen, onSuccess }) => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [miembros, setMiembros] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setNombre("");
    setTelefono("");
    setMiembros("");
    setDireccion("");
    setError(null);
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      return setError("El nombre de la familia es obligatorio.");
    }

    if (!telefono.trim()) {
      return setError("El teléfono es obligatorio.");
    }

    if (!/^\d{10}$/.test(telefono)) {
      return setError("El teléfono debe contener 10 dígitos.");
    }

    if (!miembros || Number(miembros) <= 0) {
      return setError("La cantidad de miembros debe ser mayor a 0.");
    }

    if (!direccion.trim()) {
      return setError("La dirección es obligatoria.");
    }

    setLoading(true);
    setError(null);

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
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "24px" } }}
    >
      <DialogContent sx={{ padding: "40px" }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Registrar nueva familia
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ letterSpacing: 1 ,fontSize:"15px" }}
        >
          Nombre de la familia
        </Typography>
        <TextField
          fullWidth
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          sx={{ marginBottom: 3, marginTop: 1 }}
        />

        <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ letterSpacing: 1,fontSize:"15px" }}
            >
              Número de teléfono
            </Typography>
            <TextField
              fullWidth
              value={telefono}
              onChange={(e) =>
                setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              inputProps={{
                maxLength: 10,
              }}
              sx={{ marginTop: 1 }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ letterSpacing: 1,fontSize:"15px" }}
            >
              Cantidad de miembros
            </Typography>
            <TextField
              type="number"
              fullWidth
              value={miembros}
              onChange={(e) => setMiembros(e.target.value)}
              inputProps={{
                min: 1,
              }}
              sx={{ marginTop: 1 }}
            />
          </Box>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ letterSpacing: 1 ,fontSize:"15px" }}
        >
          Dirección / Ubicación
        </Typography>
        <TextField
          fullWidth
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          sx={{ marginBottom: 4, marginTop: 1 ,fontSize:"15px"}}
          InputProps={{
            startAdornment: (
              <LocationOnOutlinedIcon
                sx={{ color: "#9ca3af", marginRight: 1 }}
              />
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
            sx={{ borderRadius: 3, textTransform: "none", paddingY: 1.5 }}
          >
            Cancelar
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="warning"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ borderRadius: 3, textTransform: "none", paddingY: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Registrar Familia"
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficiaryForm;
