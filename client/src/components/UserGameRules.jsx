import { Box, Typography } from "@mui/joy";
import { useContext } from "react";
import GameContext from "../providers/GameProvider";

function UserGameRules() {
  // @ts-ignore
  const { game } = useContext(GameContext);

  const rules = game.rules;
  console.log(rules);
  return (
    <Box>
      <Typography level="body-lg" mb={1}>
        Rounds: <b>{rules.rounds}</b> / {game.playlist.tracks_total}
      </Typography>
      <Typography level="body-lg" mb={1}>
        Time per round: <b>{rules.time_per_round}</b> seconds
      </Typography>
      <Typography level="body-lg" mb={1}>
        Speed factor: <b>{rules.speed_factor}</b>
      </Typography>
    </Box>
  );
}

export default UserGameRules;
