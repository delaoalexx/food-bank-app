import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          height: "100vh",
          overflowY: "auto",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
