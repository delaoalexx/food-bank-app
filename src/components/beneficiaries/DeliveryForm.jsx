import { useState, useEffect } from "react";
import {Box,Button,Typography,Dialog,DialogContent,TextField,MenuItem,IconButton,CircularProgress,Alert,} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import { getProducts, createEntrega } from "../../services/api";

const DeliveryForm = ({ open, setOpen, family, onSuccess }) => {
  const [renglones, setRenglones] = useState([
    { productoId: "", cantidad: "" },
  ]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
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
  };

  const handleChangeRenglon = (index, field, value) => {
    const updated = [...renglones];
    updated[index][field] = value;
    setRenglones(updated);
  };

  const productosUsados = renglones.map((r) => r.productoId).filter(Boolean);
  const getProducto = (id) => productos.find((p) => p.id === Number(id));

  const handleClose = () => {
    setRenglones([{ productoId: "", cantidad: "" }]);
    setError(null);
    setSuccess(false);
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!family?.id) {
      return setError("No hay familia seleccionada.");
    }

    if (productos.length === 0) {
      return setError(
        "No hay productos disponibles para registrar la entrega.",
      );
    }

    if (renglones.some((r) => !r.productoId || r.cantidad === "")) {
      return setError("Completa todos los productos y cantidades.");
    }

    if (
      renglones.some(
        (r) => isNaN(Number(r.cantidad)) || Number(r.cantidad) <= 0,
      )
    ) {
      return setError("Todas las cantidades deben ser mayores a 0.");
    }

    if (renglones.some((r) => !Number.isInteger(Number(r.cantidad)))) {
      return setError("Las cantidades deben ser números enteros.");
    }

    const excedeStock = renglones.some((r) => {
      const producto = getProducto(r.productoId);

      return producto && Number(r.cantidad) > producto.stock;
    });

    if (excedeStock) {
      return setError("Una o más cantidades exceden el stock disponible.");
    }

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

      if (resultados.some((r) => r === null)) {
        return setError("Error al registrar una o más entregas.");
      }

      setSuccess(true);
      onSuccess?.();

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch {
      setError("Error al registrar la entrega.");
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
      <DialogContent sx={{ padding: "40px", marginBottom: 2 }}>
        <Typography variant="h5" fontWeight="bold" mb={0.5}>
          Nueva entrega
        </Typography>
        <Typography color="text.secondary" fontSize="14px" mb={3}>
          {family?.name}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Entrega registrada!
          </Alert>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            letterSpacing: 1,fontSize:"15px"
          }}
        >
          Fecha de entrega
        </Typography>

        <TextField
          fullWidth
          value={new Date().toLocaleDateString("es-MX")}
          disabled
          sx={{ marginTop: 1, marginBottom: 3 }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ letterSpacing: 1 ,fontSize:"15px" }}
        >
          Productos
        </Typography>

        <Box
          sx={{
            marginTop: 1,
            marginBottom: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {renglones.map((renglon, index) => {
            const productoSeleccionado = getProducto(renglon.productoId);
            const cantidadNum = Number(renglon.cantidad);
            const excede =
              productoSeleccionado && cantidadNum > productoSeleccionado.stock;

            return (
              <Box
                key={index}
                sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
              >
                <Box sx={{ flex: 1 }}>
                  <TextField
                    select
                    fullWidth
                    value={renglon.productoId}
                    onChange={(e) =>
                      handleChangeRenglon(index, "productoId", e.target.value)
                    }
                  >
                    <MenuItem value="" disabled>
                      Seleccionar
                    </MenuItem>
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
                            sx={{ marginLeft: 2 }}
                          >
                            disponible: {p.stock} {p.unit}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                  {excede && (
                    <Typography fontSize="12px" color="error" mt={0.5}>
                      Excede el stock disponible ({productoSeleccionado.stock}{" "}
                      {productoSeleccionado.unit})
                    </Typography>
                  )}
                </Box>

                <Box sx={{ width: "110px" }}>
                  <TextField
                    type="number"
                    fullWidth
                    placeholder="0"
                    value={renglon.cantidad}
                    onChange={(e) =>
                      handleChangeRenglon(index, "cantidad", e.target.value)
                    }
                    error={excede}
                    inputProps={{
                      min: 1,
                      step: 1,
                    }}
                  />
                </Box>

                <IconButton
                  onClick={() => handleRemoveRenglon(index)}
                  disabled={renglones.length === 1}
                  sx={{ marginTop: 0.5, color: "#9ca3af" }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            );
          })}
        </Box>

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddRenglon}
          sx={{
            textTransform: "none",
            color: "#e07a2f",
            paddingLeft: 0,
            marginBottom: 3,
            "&:hover": {
              backgroundColor: "transparent",
              textDecoration: "underline",
            },
          }}
        >
          Agregar producto
        </Button>

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
              "Registrar entrega"
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryForm;
