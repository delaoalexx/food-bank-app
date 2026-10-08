import React, { useState, useMemo, useEffect } from "react";

import { Box, Typography, Button, Paper, Pagination } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import MainLayout from "../components/layout/MainLayout";
import SearchBar from "../components/inventory/SearchBar";
import InventoryTable from "../components/inventory/InventoryTable";
import AddProductModal from "../components/inventory/AddProductModal";
import { getProducts } from "../services/api";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;
  const [openModal, setOpenModal] = useState(false);

  // Los productos vendrán del backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        const formattedProducts = data.map((product) => ({
          id: product.id,
          name: product.nombre ?? "Sin nombre",
          category: product.categoria?.nombre || "Sin categoría",
          quantity: product.cantidad,
          unit: product.unit,
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error(err);
        setError("Error cargando productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.quantity > 0 &&
        (product.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, products]);

  // Lógica de paginación
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const handleProductCreated = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  if (error) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#171717",
          }}
        >
          Inventario
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{
            backgroundColor: "#F97316",
            borderRadius: "14px",
            textTransform: "none",
            fontWeight: 600,
            paddingX: 3,
            paddingY: 1.2,
            "&:hover": {
              backgroundColor: "#EA580C",
            },
          }}
        >
          Agregar producto
        </Button>
      </Box>

      {/* Buscador */}
      <Box sx={{ marginBottom: 3 }}>
        <SearchBar
          placeholder="Buscar productos"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </Box>

      {/* Tabla */}
      <Paper
        sx={{
          padding: 3,
          borderRadius: "24px",
          border: "1px solid #E7E5E4",
          boxShadow: "0px 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "24px",
            marginBottom: 3,
            color: "#171717",
          }}
        >
          Productos totales ({filteredProducts.length})
        </Typography>

        <InventoryTable products={currentProducts} loading={loading} />

        {totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Modal */}
      <AddProductModal
        open={openModal}
        handleClose={handleClose}
        onProductCreated={handleProductCreated}
      />
    </MainLayout>
  );
};

export default Inventory;
