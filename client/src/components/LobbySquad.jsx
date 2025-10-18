import { Box, Typography } from "@mui/joy";
import { useContext } from "react";
import GameContext from "../providers/GameProvider";
import PlayerCard from "./PlayerCard";
import AdminLobbyControls from "./AdminLobbyControls";
import UserLobbyControls from "./UserLobbyControls";

const containerStyling = {
  display: "flex",
  flexDirection: "column",
  p: 4,
};

function LobbySquad() {
  // @ts-ignore
  const { game, isAdmin } = useContext(GameContext);

  return (
    <Box sx={containerStyling}>
      <Box className="lobby-members">
        <Typography level="h2" color="primary" mb={0.25}>
          Lobby members
        </Typography>
        <Typography level="body-sm">Game ID: {game?.room_id}</Typography>
        {isAdmin ? (
          <Typography level="body-sm" color="success">
            You are the lobby administrator
          </Typography>
        ) : (
          <Typography level="body-sm">Lobby admin: {game?.host}</Typography>
        )}
        <Box
          sx={{
            mt: 4,
            maxHeight: 400,
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pr: 1,
          }}
        >
          {game?.players.map((player) => (
            <PlayerCard
              user={player}
              key={player.id}
              onRemove={() => console.log("remove")}
            />
          ))}
        </Box>
      </Box>
      {isAdmin ? <AdminLobbyControls /> : <UserLobbyControls />}
    </Box>
  );
}

export default LobbySquad;
