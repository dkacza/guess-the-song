import { Box, Button, Card, Typography } from "@mui/joy";
import { FaSpotify } from "react-icons/fa";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const containerStyling = {
  maxWidth: 320,
  display: "flex",
  flexDirection: "column",
  p: 3,
};

function SpotifyLogin() {
  const handleLogin = async () => {
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  return (
    <Card variant="outlined" sx={containerStyling}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <FaSpotify size={72} color="#1DB954" />
      </Box>

      <Typography sx={{ textAlign: "center", mb: 2 }} color="neutral">
        To access the app a premium subscription of Spotify is required
      </Typography>

      <Button color="success" sx={{ mt: "auto" }} onClick={handleLogin}>
        Log in
      </Button>
    </Card>
  );
}

export default SpotifyLogin;
