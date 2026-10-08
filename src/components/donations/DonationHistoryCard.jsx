import { Box, Typography } from "@mui/material";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

const DonationHistoryCard = ({ donor, description, date }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            backgroundColor: "#fff4ed",
            borderRadius: 3,
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardGiftcardOutlinedIcon sx={{ color: "#e07a2f" }} />
        </Box>
        <Box>
          <Typography fontWeight="bold">{donor}</Typography>
          <Typography color="text.secondary" fontSize="14px">
            {description}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#6b7280" }}>
        <CalendarTodayOutlinedIcon fontSize="small" />
        <Typography fontSize="14px">{date}</Typography>
      </Box>
    </Box>
  );
};

export default DonationHistoryCard;