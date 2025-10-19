import { Typography } from "@mui/joy";
import { useContext } from "react";
import GameContext from "../providers/GameProvider";

function RoundHeading() {
  const { game } = useContext(GameContext);

  let text = `Round ${game?.round + 1} results`;
  if (game?.round == 0) {
    text = "Get ready!";
  }
  return (
    <Typography level="h1" color="primary">
      {text}
    </Typography>
  );
}

export default RoundHeading;
