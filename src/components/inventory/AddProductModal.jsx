import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Alert,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";

import { createProduct, getCategories } from "../../services/api";

const rowFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
  },
};

const errorKeys = {
  name: "name",
  categoryId: "category",
  quantity: "quantity",
  unit: "unit",
};

const AddProductModal = ({ open, handleClose, onProductCreated }) => {
  const nextId = useRef(1);
  const newProducto = () => ({
    id: nextId.current++,
    name: "",
    categoryId: "",
    quantity: "",
    unit: "",
  });

  const [productos, setProductos] = useState(() => [newProducto()]);
  const [focusId, setFocusId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const submitLock = useRef(false);
  const listEndRef = useRef(null);
  const prevCount = useRef(1);

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setSuccess(false);
    setError(null);

    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, [open]);

  useEffect(() => {
    if (productos.length > prevCount.current) {
      listEndRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
    prevCount.current = productos.length;
  }, [productos.length]);

  const resetForm = () => {
    setProductos([newProducto()]);
    setFocusId(null);

    setErrors({});
    setSuccess(false);
    setError(null);
  };

  const handleModalClose = () => {
    submitLock.current = false;
    resetForm();
    handleClose();
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
      delete copy[`name_${id}`];
      delete copy[`category_${id}`];
      delete copy[`quantity_${id}`];
      delete copy[`unit_${id}`];
      return copy;
    });
  };

  const handleChangeProducto = (id, field, value) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
    setErrors((prev) => ({ ...prev, [`${errorKeys[field]}_${id}`]: "" }));
  };

  const handleQuantityKeyDown = (e, prod) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (prod.name.trim() && prod.categoryId && prod.quantity) {
      handleAddProducto();
    }
  };

  const handleSubmit = async () => {
    if (loading || submitLock.current) return;

    submitLock.current = true;

    const newErrors = {};

    productos.forEach((p) => {
      if (!p.name.trim()) {
        newErrors[`name_${p.id}`] = "Ingresa el producto";
      }

      if (!p.quantity) {
        newErrors[`quantity_${p.id}`] = "Requerida";
      } else if (Number(p.quantity) <= 0) {
        newErrors[`quantity_${p.id}`] = "Mayor a 0";
      }

      if (!p.unit) {
        newErrors[`unit_${p.id}`] = "Selecciona";
      }

      if (!p.categoryId) {
        newErrors[`category_${p.id}`] = "Selecciona";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      submitLock.current = false;
      return;
    }

    try {
      setErrors({});
      setSuccess(false);
      setError(null);
      setLoading(true);

      const results = await Promise.allSettled(
        productos.map(async (p) => {
          const createdProduct = await createProduct({
            nombre: p.name.trim(),
            categoria_id: Number(p.categoryId),
            cantidad: Number(p.quantity),
            unit: p.unit,
          });

          return {
            id: createdProduct.id,
            name: createdProduct.nombre,
            category:
              categories.find((cat) => cat.id === Number(p.categoryId))
                ?.nombre || "Sin categoría",
            quantity: createdProduct.cantidad,
            unit: createdProduct.unit,
          };
        }),
      );

      results.forEach((r) => {
        if (r.status === "fulfilled") onProductCreated(r.value);
      });

      const fallidos = productos.filter(
        (_, i) => results[i].status === "rejected",
      );

      if (fallidos.length === 0) {
        setSuccess(true);

        setTimeout(() => {
          handleModalClose();
          submitLock.current = false;
        }, 500);
      } else {
        setProductos(fallidos);
        setError(
          `No se pudieron agregar ${fallidos.length} de ${productos.length} productos. Los demás ya quedaron guardados; revisa los que siguen en la lista y vuelve a intentar.`,
        );
        submitLock.current = false;
      }
    } catch (error) {
      console.error(error);
      setError("Error al agregar los productos.");
      submitLock.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleModalClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: "12px",
          width: "100%",
          maxWidth: "760px",
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
          Agregar producto
        </Typography>
      </Box>

      {(error || success) && (
        <Box
          sx={{
            padding: "0px 24px 16px 24px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
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
              {productos.length > 1
                ? "¡Productos agregados correctamente!"
                : "¡Producto agregado correctamente!"}
            </Alert>
          )}
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
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {productos.map((prod, index) => (
            <Box
              key={prod.id}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr 40px",
                  sm: "28px 1.6fr 1.2fr 0.8fr 1fr 40px",
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

              {/* Campo Producto */}
              <TextField
                fullWidth
                size="small"
                autoFocus={prod.id === focusId}
                label="Producto"
                placeholder="Alimento/producto"
                value={prod.name}
                onChange={(e) =>
                  handleChangeProducto(prod.id, "name", e.target.value)
                }
                error={!!errors[`name_${prod.id}`]}
                helperText={errors[`name_${prod.id}`]}
                sx={{
                  ...rowFieldStyle,
                  gridColumn: { xs: "1 / 3", sm: "auto" },
                }}
              />

              {/* Campo Categoría */}
              <TextField
                fullWidth
                select
                size="small"
                label="Categoría"
                value={prod.categoryId}
                onChange={(e) =>
                  handleChangeProducto(prod.id, "categoryId", e.target.value)
                }
                error={!!errors[`category_${prod.id}`]}
                helperText={errors[`category_${prod.id}`]}
                sx={{
                  ...rowFieldStyle,
                  gridColumn: { xs: "1 / -1", sm: "auto" },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                size="small"
                label="Cantidad"
                type="number"
                value={prod.quantity}
                onChange={(e) =>
                  handleChangeProducto(prod.id, "quantity", e.target.value)
                }
                onKeyDown={(e) => handleQuantityKeyDown(e, prod)}
                error={!!errors[`quantity_${prod.id}`]}
                helperText={errors[`quantity_${prod.id}`]}
                inputProps={{ min: 1 }}
                sx={rowFieldStyle}
              />

              <TextField
                fullWidth
                select
                size="small"
                label="Unidad"
                value={prod.unit}
                onChange={(e) =>
                  handleChangeProducto(prod.id, "unit", e.target.value)
                }
                error={!!errors[`unit_${prod.id}`]}
                helperText={errors[`unit_${prod.id}`]}
                sx={rowFieldStyle}
              >
                <MenuItem value="pz">Pz</MenuItem>
                <MenuItem value="kg">Kg</MenuItem>
                <MenuItem value="gr">Gramos</MenuItem>
                <MenuItem value="L">Litros</MenuItem>
                <MenuItem value="ml">Mililitros</MenuItem>
              </TextField>

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

      {/* Botones de Acción */}
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
          disabled={loading}
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
          loading={loading}
          disabled={loading}
          onClick={handleSubmit}
          sx={{
            borderRadius: "12px", // 12px de borderRadius
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
            ? `Agregar productos (${productos.length})`
            : "Agregar producto"}
        </LoadingButton>
      </Box>
    </Dialog>
  );
};

export default AddProductModal;
