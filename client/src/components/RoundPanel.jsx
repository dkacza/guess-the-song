import { Box, Button, Card, Input, Slider, Typography } from "@mui/joy";
import { useContext, useEffect, useRef, useState } from "react";
import GameContext from "../providers/GameProvider";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SpotifyContext from "../providers/SpotifyProvider";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

const mainContainerStyling = {
  display: "flex",
  flexDirection: "column",
  p: 4,
  alignItems: "center",
};

function RoundPanel() {
  // @ts-ignore
  const { game, handleUserGuess } = useContext(GameContext);
  // @ts-ignore
  const { paused, togglePlay } = useContext(SpotifyContext);

  const handleTogglePlay = () => {
    togglePlay();
  };
  const isPlaying = !paused;

  const totalTime = game?.rules?.time_per_round || 20;
  const [remainingTime, setRemainingTime] = useState(totalTime);
  const [titleGuess, setTitleGuess] = useState("");
  const [artistGuess, setArtistGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const startTimeRef = useRef(Date.now());

  const roundNumber = (game?.round || 0) + 1;
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  const roundTimeString = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const handleSubmit = () => {
    if (submitted) return;
    const elapsedMs = Math.round(Date.now() - startTimeRef.current);

    const guess = {
      title: titleGuess.trim(),
      artist: artistGuess.trim(),
    };

    handleUserGuess(guess, elapsedMs);
    setSubmitted(true);
  };

  const handleTimeout = () => {
    if (submitted) return;
    handleSubmit();
  };

  useEffect(() => {
    setRemainingTime(totalTime);
    startTimeRef.current = Date.now();
    setSubmitted(false);

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.round_index]); // restart timer on new round

  return (
    <>
      <Box sx={mainContainerStyling}>
        <Typography level="h1" color="primary">
          Round {roundNumber}
        </Typography>
        <Typography>Total rounds: {game?.rules.rounds}</Typography>
        <Typography
          level="h3"
          mt={4}
          color={remainingTime > 10 ? "neutral" : "danger"}
        >
          {roundTimeString}
        </Typography>
        <Typography></Typography>
        <Card
          sx={{
            mt: 8,
            width: 400,
            height: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 40,
            cursor: "pointer",
            ":hover": { bgcolor: "neutral.softBg" },
          }}
          onClick={() => {
            handleTogglePlay(); // 🪄 call your context function
          }}
        >
          {isPlaying ? (
            <StopIcon sx={{ fontSize: 200 }} />
          ) : (
            <PlayArrowIcon color="success" sx={{ fontSize: 200 }} />
          )}
        </Card>
        <Box sx={{ display: "flex", minWidth: 300, gap: 4, mt: 2 }}>
          <VolumeUpIcon color="primary" sx={{ fontSize: 48 }} />
          <Slider />
        </Box>
        <Box
          component="form"
          sx={{ mt: 8, gap: 2, display: "flex", flexDirection: "column" }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Input
            placeholder="Title"
            value={titleGuess}
            onChange={(e) => setTitleGuess(e.target.value)}
            disabled={submitted}
          />
          <Input
            placeholder="Artist"
            value={artistGuess}
            onChange={(e) => setArtistGuess(e.target.value)}
            disabled={submitted}
          />
          <Button
            type="submit"
            color="success"
            disabled={submitted && remainingTime > 0}
          >
            {submitted ? "Submitted" : "Submit"}
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default RoundPanel;
