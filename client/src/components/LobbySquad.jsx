import { DeleteOutline, StartOutlined } from "@mui/icons-material";
import { Box, Button, Snackbar, Typography } from "@mui/joy";
import { useContext, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import GameContext from "../providers/GameProvider";
import { useNavigate } from "react-router-dom";

const containerStyling = {
  display: "flex",
  flexDirection: "column",
  p: 4,
};

function LobbySquad() {
  const [copied, setCopied] = useState(false);
  const gameCode = "ABCD1234";
  const { room, deleteGame } = useContext(GameContext);
  const navigate = useNavigate();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // hide popup after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const handleLobbyResolve = async () => {
    deleteGame(room.room_id);
    navigate("/");
  };

  return (
    <Box sx={containerStyling}>
      <Box className="lobby-members">
        <Typography level="h2" color="primary" mb={4}>
          Lobby members
        </Typography>
        <Box
          sx={{
            maxHeight: 400,
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pr: 1,
          }}
        ></Box>
      </Box>

      <Box
        sx={{
          mt: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<ContentCopyIcon />}
          onClick={handleCopyCode}
          sx={{
            gridColumn: "1 / span 2",
            justifySelf: "center",
            width: "100%",
          }}
        >
          Copy Access Code
        </Button>
        <Button
          color="danger"
          startDecorator={<DeleteOutline />}
          onClick={handleLobbyResolve}
        >
          Resolve lobby
        </Button>
        <Button color="success" startDecorator={<StartOutlined />}>
          Start the game
        </Button>
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        color="success"
        variant="soft"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        Game code copied to clipboard!
      </Snackbar>
    </Box>
  );
}

export default LobbySquad;
