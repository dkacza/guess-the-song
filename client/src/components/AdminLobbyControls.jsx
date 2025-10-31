import { Box, Button, Snackbar } from "@mui/joy";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { DeleteOutline, StartOutlined } from "@mui/icons-material";
import { useContext } from "react";
import GameContext from "../providers/GameProvider";
import { useNavigate } from "react-router-dom";
import NotificationContext, {
  CustomNotification,
} from "../providers/NotificationProvider";

function AdminLobbyControls() {
  // @ts-ignore
  const { game, handleDeleteGame, handleStartGame } = useContext(GameContext);
  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(game.access_code);
      addNotification(
        new CustomNotification("success", "Game code copied to clipboard")
      );
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const handleLobbyResolve = async () => {
    handleDeleteGame(game.room_id);
    navigate("/");
  };
  const handleGameStart = async () => {
    if (!game?.playlist) {
      addNotification(
        new CustomNotification("error", "Select the playlist to start the game")
      );
      return;
    }
    await handleStartGame();
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
        <Button
          color="success"
          startDecorator={<StartOutlined />}
          onClick={handleGameStart}
        >
          Start the game
        </Button>
      </Box>
    </>
  );
}

export default AdminLobbyControls;
