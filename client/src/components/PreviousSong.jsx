import { Box, Card, Typography } from "@mui/joy";
import { useContext } from "react";
import GameContext from "../providers/GameProvider";

function PreviousSong() {
  const { game } = useContext(GameContext);
  const previousSong = game?.previous_track?.track;

  return (
    <Card sx={{ display: "flex", flexDirection: "row", maxWidth: 600 }}>
      <Box
        sx={{
          width: 120,
          height: 120,
          flexShrink: 0,
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <img
          src={previousSong.album.images[0].url}
          alt="Album cover"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </Box>
      <Box>
        <Typography level="h2" color="primary" mb={2}>
          {previousSong?.name}
        </Typography>
        <Typography>
          Artist:{" "}
          {(previousSong?.artists || [])
            .map((artist) => artist?.name)
            .join(", ")}
        </Typography>
        <Typography>Album: {previousSong?.album?.name}</Typography>
      </Box>
    </Card>
  );
}

export default PreviousSong;
