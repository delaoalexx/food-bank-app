import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Box,
} from "@mui/material";

import InventoryRow from "./InventoryRow";

const InventoryTable = ({
  products = [],
  isReplica = false,
  loading = false,
}) => {
  return (
    <TableContainer>
      <Table
        sx={{
          tableLayout: "fixed",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 700,
                color: "#737373",
              }}
            >
              Producto
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                color: "#737373",
              }}
            >
              Código
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                color: "#737373",
              }}
            >
              Categoría
            </TableCell>

            {!isReplica && (
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#737373",
                }}
              >
                Cantidad
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            [...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Skeleton variant="rounded" width={38} height={38} />

                    <Skeleton width={120} height={24} />
                  </Box>
                </TableCell>

                <TableCell>
                  <Skeleton width={50} />
                </TableCell>

                <TableCell>
                  <Skeleton width={100} />
                </TableCell>

                {!isReplica && (
                  <TableCell>
                    <Skeleton width={70} />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isReplica ? 3 : 4}
                align="center"
                sx={{
                  paddingY: 6,
                  color: "#A3A3A3",
                  fontSize: "15px",
                  borderBottom: "none",
                }}
              >
                Sin productos registrados
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <InventoryRow
                key={product.id}
                product={product}
                isReplica={isReplica}
              />
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default React.memo(InventoryTable);
