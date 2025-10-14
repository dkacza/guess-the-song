import { Box, Button, Snackbar } from "@mui/joy";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { DeleteOutline, StartOutlined } from "@mui/icons-material";
import { useContext, useState } from "react";
import GameContext from "../providers/GameProvider";
import { useNavigate } from "react-router-dom";

function AdminLobbyControls() {
  const { game, deleteGame } = useContext(GameContext);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(game.access_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // hide popup after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const handleLobbyResolve = async () => {
    deleteGame(game.room_id);
    navigate("/");
  };

  return (
    <>
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
    </>
  );
}

export default AdminLobbyControls;
