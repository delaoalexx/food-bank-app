import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { requestProduct } from "../../services/api";

const RequestProductModal = ({
  open,
  handleClose,
  product,
  branchName,
  sourceBranchKey,
  onSuccessTransfer,
}) => {
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Reiniciar estado al abrir el modal con un producto nuevo
  useEffect(() => {
    if (open) {
      setCantidad("");
      setMotivo("");
      setErrors({});
      setSuccess(false);
    }
  }, [open, product]);

  const cantidadNum = Number(cantidad);

  const handleSubmit = async () => {
    const newErrors = {};

    if (!cantidad) {
      newErrors.cantidad = "Ingresa una cantidad";
    } else if (isNaN(cantidadNum) || cantidadNum <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors((prev) => ({
        ...prev,
        cantidad: "",
      }));
      await requestProduct(sourceBranchKey, product.id, cantidadNum, motivo);
      setSuccess(true);
      setTimeout(async () => {
        await onSuccessTransfer();
      }, 1000);
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo completar la solicitud. Intenta de nuevo.";
      setErrors({
        general: mensaje,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleCerrar}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "32px",
          padding: 2,
        },
      }}
    >
      <DialogContent>
        {success ? (
          /* ── Vista de éxito ── */
          <Box sx={{ textAlign: "center", paddingY: 4 }}>
            <Box sx={{ marginBottom: 2 }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F97316"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </Box>
            <Typography
              sx={{
                fontSize: "26px",
                fontWeight: "Bold",
                color: "#171717",
                marginBottom: 1,
              }}
            >
              ¡Solicitud enviada!
            </Typography>
            <Typography sx={{ color: "#525252", marginBottom: 4 }}>
              Se ha solicitado{" "}
              <strong>
                {cantidadNum} {product?.unit}
              </strong>{" "}
              de <strong>{product?.name}</strong> a{" "}
              <strong>{branchName}</strong>.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCerrar}
              sx={{
                borderRadius: "16px",
                paddingY: 1.5,
                textTransform: "none",
                backgroundColor: "#F97316",
                "&:hover": { backgroundColor: "#EA580C" },
              }}
            >
              Cerrar
            </Button>
          </Box>
        ) : (
          /* ── Formulario ── */
          <>
            {/* Título */}
            <Typography
              sx={{
                fontSize: "38px",
                fontWeight: "Bold",
                color: "#171717",
                marginBottom: 4,
              }}
            >
              Solicitar Producto
            </Typography>

            {/* Sucursal */}
            <Box sx={{ marginBottom: 3 }}>
              <Typography
                sx={{ fontWeight: "Bold", color: "#525252", marginBottom: 1 }}
              >
                Solicitando a:
              </Typography>
              <Typography
                sx={{ fontWeight: "Bold", fontSize: "28px", color: "#171717" }}
              >
                {branchName}
              </Typography>
            </Box>

            {/* Error */}
            {errors.general && (
              <Alert
                severity="error"
                sx={{
                  marginBottom: 3,
                  borderRadius: "12px",
                }}
              >
                {errors.general}
              </Alert>
            )}

            {/* Producto (solo lectura) */}
            <TextField
              fullWidth
              label="Producto"
              value={product?.name || ""}
              disabled
              sx={{ marginBottom: 3 }}
            />

            {/* Cantidad + Unidad */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                marginBottom: 3,
              }}
            >
              <TextField
                fullWidth
                label="Cantidad *"
                type="number"
                value={cantidad}
                onChange={(e) => {
                  setCantidad(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    cantidad: "",
                  }));
                }}
                inputProps={{ min: 1, step: 1 }}
                error={!!errors.cantidad}
                helperText={errors.cantidad}
              />
              <TextField
                fullWidth
                label="Unidad"
                value={product?.unit || ""}
                disabled
              />
            </Box>

            {/* Motivo (opcional) */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivo de la solicitud (opcional)"
              placeholder="Explica brevemente por qué necesitas este producto..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              sx={{ marginBottom: errors.general ? 2 : 4 }}
            />

            {/* Botones */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCerrar}
                disabled={loading}
                sx={{
                  borderRadius: "16px",
                  paddingY: 1.5,
                  textTransform: "none",
                }}
              >
                Cancelar
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  borderRadius: "16px",
                  paddingY: 1.5,
                  textTransform: "none",
                  backgroundColor: "#F97316",
                  "&:hover": { backgroundColor: "#EA580C" },
                  "&.Mui-disabled": {
                    backgroundColor: "#FDBA74",
                    color: "#fff",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Enviar Solicitud"
                )}
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestProductModal;
