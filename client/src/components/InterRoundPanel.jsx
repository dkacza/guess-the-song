import { Box, Button, Typography } from "@mui/joy";
import RoundHeading from "./RoundHeading";
import { useContext } from "react";
import GameContext from "../providers/GameProvider";
import PreviousSong from "./PreviousSong";
import Leaderboard from "./Leaderboard";
import AuthContext from "../providers/AuthProvider";

function InterRoundPanel() {
  // @ts-ignore
  const { game, isAdmin, handlePrepareForNextRound, handleDeleteGame } =
    useContext(GameContext);
  // @ts-ignore
  const { user } = useContext(AuthContext);

  const isLastRound = game?.round == game?.rules.rounds;

  async function handleNextRound() {
    await handlePrepareForNextRound();
  }

  const disabled = game?.ready_players?.includes(user.id) || false;

  return (
    <Box sx={{ display: "flex", width: "100%", p: 4, gap: 12 }}>
      <Box>
        <RoundHeading />
        <Leaderboard />
      </Box>
      <Box sx={{ minWidth: 640, display: "flex", flexDirection: "column" }}>
        {game?.round >= 1 ? (
          <Box sx={{ mt: 10 }}>
            <Typography level="h3" color="primary" mb={2}>
              Song from the previous round
            </Typography>
            <PreviousSong />
          </Box>
        ) : (
          <></>
        )}
        <Box sx={{ mt: "auto", alignSelf: "flex-end" }}>
          {!isLastRound ? (
            <Button
              sx={{ width: 240 }}
              color="success"
              onClick={handleNextRound}
              disabled={disabled}
            >
              {disabled
                ? "Waiting for other players"
                : "Ready for the next round"}
            </Button>
          ) : (
            <></>
          )}
          {isAdmin && isLastRound ? (
            <Button
              sx={{ width: 240 }}
              color="success"
              onClick={handleDeleteGame}
            >
              Finish the game
            </Button>
          ) : (
            <></>
          )}
          <Typography level="body-sm">Game status: {game.status}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default InterRoundPanel;
