import { Card, CardContent, Typography, Box } from "@mui/material";

const StatCard = ({ title, value, description }) => {
  return (
    <Card
      sx={{
        borderRadius: "12px",
        border: "1px solid #E7E5E4",
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#FFFFFF",
        height: "122px",
        boxSizing: "border-box",
      }}
    >
      <CardContent
        sx={{
          padding: "16px !important",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* TÍTULO */}
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#737373",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>

        {/* VALOR Y DESCRIPCIÓN */}
        <Box>
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 700,
              lineHeight: 1,
              color: "#171717",
              marginBottom: 0.5,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              fontSize: "12px",
              color: "#A3A3A3",
              fontWeight: 500,
            }}
          >
            {description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
