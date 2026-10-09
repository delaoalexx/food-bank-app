import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography, Paper, Pagination } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import MainLayout from "../components/layout/MainLayout";
import SearchBar from "../components/inventory/SearchBar";
import InventoryTable from "../components/inventory/InventoryTable";
import BranchSelector from "../components/network/BranchSelector";
import {
  CURRENT_NODE,
  getBranchProducts,
  getReplicaProducts,
} from "../services/api";

const NetworkInventory = () => {
  const allBranches = [
    { id: 1, key: "lapaz", branchName: "La Paz" },
    { id: 2, key: "comondu", branchName: "Comondú" },
    { id: 3, key: "loreto", branchName: "Loreto" },
    { id: 4, key: "mulege", branchName: "Mulegé" },
  ];

  const availableBranches = useMemo(
    () => allBranches.filter((branch) => branch.key !== CURRENT_NODE),
    [CURRENT_NODE]
  );

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [branchProducts, setBranchProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isReplica, setIsReplica] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const productsPerPage = 5;

  const CATEGORIAS = {
    1: "Perecederos",
    2: "No Perecederos",
    3: "Refrigerados",
    4: "Congelados",
    5: "Bebidas",
    6: "Infantiles",
    7: "Higiene",
    8: "Otros",
  };

  useEffect(() => {
    if (availableBranches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(availableBranches[0].id);
    }
  }, [availableBranches, selectedBranchId]);

  const selectedBranchData = useMemo(
    () => availableBranches.find((branch) => branch.id === selectedBranchId),
    [selectedBranchId, availableBranches]
  );

  const fetchProducts = async () => {
    if (!selectedBranchData) return;

    try {
      setLoading(true);
      setError("");
      setIsReplica(false);

      const data = await getBranchProducts(selectedBranchData.key);

      if (data && data.length > 0) {
        const formattedProducts = data.map((product) => ({
          id: product.id,
          name: product.nombre ?? "Sin nombre",
          category: product.categoria?.nombre || "Sin categoría",
          quantity: product.cantidad,
          unit: product.unit,
        }));

        setBranchProducts(formattedProducts);
        return;
      }

      throw new Error("Nodo sin respuesta");
    } catch (err) {
      console.warn("Nodo no disponible. Usando réplica.");

      try {
        const replicas = await getReplicaProducts();

        const productosReplica = replicas.filter(
          (p) =>
            p.banco_origen?.toLowerCase() ===
            selectedBranchData.key.toLowerCase()
        );

        const formattedReplica = productosReplica.map((product) => ({
          id: product.id_producto,
          name: product.nombre,
          category: CATEGORIAS[product.categoria_id] || "Sin categoría",
          isReplica: true,
        }));

        setBranchProducts(formattedReplica);
        setIsReplica(true);
      } catch (e) {
        setBranchProducts([]);
        setError("No fue posible obtener inventario ni réplica.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedBranchData]);

  const filteredProducts = useMemo(
    () =>
      branchProducts.filter(
        (product) =>
          (isReplica || product.quantity > 0) &&
          (product.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [branchProducts, searchTerm, isReplica]
  );

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, page]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleBranchChange = (event) => {
    setSelectedBranchId(event.target.value);
    setPage(1);
    setSearchTerm("");
  };

  return (
    <MainLayout>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            minHeight: "44px",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#171717",
            }}
          >
            Red de inventarios
          </Typography>

          <BranchSelector
            branches={availableBranches}
            selectedBranch={selectedBranchId}
            onChange={handleBranchChange}
          />
        </Box>

        <Box sx={{ width: "100%" }}>
          <SearchBar
            placeholder="Buscar productos"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </Box>

        {/* ALERTA DE DATO REPLICADO */}
        {isReplica && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.2,
              borderRadius: "12px",
              backgroundColor: "#FFFBEB",
              border: "1px solid #FDE68A",
              color: "#92400E",
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 22 }} />
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Mostrando datos replicados. La sucursal seleccionada no está disponible.
            </Typography>
          </Box>
        )}

        <Paper
          sx={{
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #E7E5E4",
            boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
            backgroundColor: "#FFFFFF",
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "20px",
              marginBottom: 2,
              color: "#171717",
            }}
          >
            {isReplica
              ? `Productos replicados (${filteredProducts.length})`
              : `Productos totales (${filteredProducts.length})`}
          </Typography>

          {error ? (
            <Box sx={{ paddingY: 8, textAlign: "center" }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <>
              <InventoryTable
                products={paginatedProducts}
                isReplica={isReplica}
                loading={loading}
              />

              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 3,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    sx={{
                      "& .MuiPaginationItem-root.Mui-selected": {
                        backgroundColor: "#029739",
                        color: "#ffffff",
                        "&:hover": {
                          backgroundColor: "#027a2e",
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Paper>

      </Box>
    </MainLayout>
  );
};

export default NetworkInventory;