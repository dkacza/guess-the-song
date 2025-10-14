import { useContext } from "react";
import { Box, Button, Typography } from "@mui/joy";
import LogoutIcon from "@mui/icons-material/Logout";
import GameContext from "../providers/GameProvider";
import { useNavigate } from "react-router-dom";

function UserLobbyControls() {
  const { game, leaveGame } = useContext(GameContext);
  const navigate = useNavigate();

  const handleLeaveGame = async () => {
    leaveGame(game.room_id);
    navigate("/");
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        mt: "auto",
      }}
    >
      <Typography sx={{ mb: 2 }} color="neutral">
        Waiting for the lobby administrator to start the game
      </Typography>
      <Button
        color="danger"
        startDecorator={<LogoutIcon />}
        onClick={handleLeaveGame}
      >
        Leave the lobby
      </Button>
    </Box>
  );
}

export default UserLobbyControls;
