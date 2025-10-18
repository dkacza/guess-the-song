import { Box, Button, Slider, Typography } from "@mui/joy";
import { useContext, useEffect, useState } from "react";
import GameContext from "../providers/GameProvider";

function AdminGameRules() {
  const { game, handleSetRules } = useContext(GameContext);

  const maxRounds = game?.playlist?.tracks_total || 10;

  const [rules, setRules] = useState({
    rounds: 10,
    timePerRound: 20,
    speedFactor: 0.5,
  });

  useEffect(() => {
    if (game?.rules) {
      setRules({
        rounds: game.rules.rounds ?? 10,
        timePerRound: game.rules.time_per_round ?? 20,
        speedFactor: game.rules.speed_factor ?? 0.5,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyRules = async () => {
    await handleSetRules({
      rounds: rules.rounds,
      time_per_round: rules.timePerRound,
      speed_factor: rules.speedFactor,
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography level="body-lg">
          Rounds: <b>{rules.rounds}</b> / {maxRounds}
        </Typography>
        <Slider
          min={1}
          max={maxRounds}
          value={rules.rounds}
          onChange={(e, val) => setRules((prev) => ({ ...prev, rounds: val }))}
        />
        <Typography level="body-xs" color="neutral">
          Number of songs that will be played in this game
        </Typography>
      </Box>
      <Box sx={{ mb: 3 }}>
        <Typography level="body-lg" mb={1}>
          Time per round: <b>{rules.timePerRound}</b> seconds
        </Typography>
        <Slider
          min={5}
          max={60}
          value={rules.timePerRound}
          onChange={(e, val) =>
            setRules((prev) => ({ ...prev, timePerRound: val }))
          }
        />
        <Typography level="body-xs" color="neutral">
          The time in which the players must guess the song
        </Typography>
      </Box>
      <Box>
        <Typography level="body-lg" mb={1}>
          Speed factor: <b>{rules.speedFactor.toFixed(1)}</b>
        </Typography>
        <Slider
          min={0}
          max={1}
          step={0.1}
          value={rules.speedFactor}
          onChange={(e, val) =>
            setRules((prev) => ({ ...prev, speedFactor: val }))
          }
        />
        <Typography level="body-xs" color="neutral">
          Defines how much answer speed influences scored points (0 = no
          influence, 1 = highest influence)
        </Typography>
      </Box>
      <Button sx={{ mt: 4 }} variant="outlined" onClick={applyRules}>
        Apply Rules
      </Button>
    </Box>
  );
}

export default AdminGameRules;
