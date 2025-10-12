import { DeleteOutline, StartOutlined } from "@mui/icons-material";
import { Box, Button, Card, IconButton, Typography } from "@mui/joy";

const containerStyling = {
  display: "flex",
  flexDirection: "column",
  p: 4,
};

function LobbySquad() {
  return (
    <Box sx={containerStyling}>
      <Box>
        <Typography level="h2" color="primary" mb={4}>
          Lobby members
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 4, mt: "auto" }}>
        <Button color="danger" endDecorator={<DeleteOutline />}>
          Resolve lobby
        </Button>
        <Button color="success" endDecorator={<StartOutlined />}>
          Start the game
        </Button>
      </Box>
    </Box>
  );
}

export default LobbySquad;
