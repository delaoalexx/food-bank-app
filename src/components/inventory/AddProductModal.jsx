import React, { useState, useEffect, useRef } from "react";
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

import { createProduct, getCategories } from "../../services/api";

const AddProductModal = ({ open, handleClose, onProductCreated }) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const submitLock = useRef(false);

  // Estilo reutilizable para forzar border-radius de 12px en los TextFields
  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
    },
  };

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setSuccess(false);

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

  const resetForm = () => {
    setName("");
    setQuantity("");
    setUnit("");
    setCategoryId("");

    setErrors({});
    setSuccess(false);
  };

  const handleModalClose = () => {
    submitLock.current = false;
    resetForm();
    handleClose();
  };

  const handleSubmit = async () => {
    if (loading || submitLock.current) return;

    submitLock.current = true;

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Ingresa el nombre del producto";
    }

    if (!quantity) {
      newErrors.quantity = "Ingresa una cantidad";
    } else if (Number(quantity) <= 0) {
      newErrors.quantity = "La cantidad debe ser mayor a 0";
    }

    if (!unit) {
      newErrors.unit = "Selecciona una unidad";
    }

    if (!categoryId) {
      newErrors.category = "Selecciona una categoría";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      submitLock.current = false;
      return;
    }

    try {
      setErrors({});
      setSuccess(false);
      setLoading(true);

      const createdProduct = await createProduct({
        nombre: name,
        categoria_id: Number(categoryId),
        cantidad: Number(quantity),
        unit,
      });

      const formattedProduct = {
        id: createdProduct.id,
        name: createdProduct.nombre,
        category:
          categories.find((cat) => cat.id === Number(categoryId))?.nombre ||
          "Sin categoría",
        quantity: createdProduct.cantidad,
        unit: createdProduct.unit,
      };

      onProductCreated(formattedProduct);

      setSuccess(true);

      setTimeout(() => {
        handleModalClose();
        submitLock.current = false;
      }, 500);
    } catch (error) {
      console.error(error);
      submitLock.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleModalClose}
      PaperProps={{
        sx: {
          borderRadius: "12px", // Modal con 12px
          width: "100%",
          maxWidth: "576px",
          margin: "16px",
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
          Agregar producto
        </Typography>
      </Box>

      {/* MODAL FORM */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "0px 24px 32px 24px",
          gap: "24px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {success && (
          <Alert
            severity="success"
            sx={{ width: "100%", borderRadius: "12px" }}
          >
            ¡Producto agregado correctamente!
          </Alert>
        )}

        {/* Campo Producto */}
        <TextField
          fullWidth
          label="Producto"
          placeholder="Alimento/producto"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
          error={!!errors.name}
          helperText={errors.name}
          sx={textFieldStyle} // 12px de borderRadius
        />

        {/* Campo Categoría */}
        <TextField
          fullWidth
          select
          label="Categoría"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setErrors((prev) => ({ ...prev, category: "" }));
          }}
          error={!!errors.category}
          helperText={errors.category}
          sx={textFieldStyle} // 12px de borderRadius
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.nombre}
            </MenuItem>
          ))}
        </TextField>

        {/* Cantidad + Unidad */}
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
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setErrors((prev) => ({ ...prev, quantity: "" }));
            }}
            error={!!errors.quantity}
            helperText={errors.quantity}
            inputProps={{ min: 1 }}
            sx={textFieldStyle} // 12px de borderRadius
          />

          <TextField
            fullWidth
            select
            label="Unidad"
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setErrors((prev) => ({ ...prev, unit: "" }));
            }}
            error={!!errors.unit}
            helperText={errors.unit}
            sx={textFieldStyle} // 12px de borderRadius
          >
            <MenuItem value="pz">Pz</MenuItem>
            <MenuItem value="kg">Kg</MenuItem>
            <MenuItem value="gr">Gramos</MenuItem>
            <MenuItem value="L">Litros</MenuItem>
            <MenuItem value="ml">Mililitros</MenuItem>
          </TextField>
        </Box>

        {/* Botones de Acción */}
        <Box
          sx={{
            display: "flex",
            gap: "16px",
            width: "100%",
            marginTop: 1,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={handleModalClose}
            disabled={loading}
            sx={{
              borderRadius: "12px", // 12px de borderRadius
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
            Agregar producto
          </LoadingButton>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AddProductModal;
