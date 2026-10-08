import { Box, Typography } from "@mui/material";

const BeneficiaryStatCard = ({ icon, value, label }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        backgroundColor: "#ffffff",
        borderRadius: 4,
        padding: "24px 32px",
        flex: 1,
        border: "1px solid #e5e7eb",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#fff4ed",
          borderRadius: 3,
          padding: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h3" fontWeight="bold">{value}</Typography>
        <Typography color="text.secondary" fontSize="14px">{label}</Typography>
      </Box>
    </Box>
  );
};

export default BeneficiaryStatCard;