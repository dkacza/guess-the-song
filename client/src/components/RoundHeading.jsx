import { Box, Typography } from "@mui/joy";
import { useContext } from "react";
import GameContext from "../providers/GameProvider";

function RoundHeading() {
  // @ts-ignore
  const { game } = useContext(GameContext);

  let text = `Round ${game?.round} results`;
  if (game?.round == 0) {
    text = "Get ready!";
  } else if (game?.round == game?.rules.rounds) {
    text = "Game Over!";
  }
  return (
    <Box>
      <Typography level="h1" color="primary">
        {text}
      </Typography>
      <Typography>Total rounds: {game?.rules.rounds}</Typography>
    </Box>
  );
}

export default RoundHeading;
