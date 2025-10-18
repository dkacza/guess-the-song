import {
  Box,
  Button,
  Card,
  Divider,
  Input,
  Slider,
  Typography,
} from "@mui/joy";
import { useContext, useState } from "react";
import GameContext from "../providers/GameProvider";
import AdminGameRules from "./AdminGameRules";
import UserGameRules from "./UserGameRules";

const containerStyling = {
  display: "flex",
  flexDirection: "column",
  width: "60vw",
  p: 4,
};

function PlaylistSelect() {
  // @ts-ignore
  const { game, handleSetPlaylist, isAdmin } = useContext(GameContext);
  const [url, setUrl] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    handleSetPlaylist(url);
    setUrl("");
  };

  return (
    <Box sx={containerStyling}>
      <Typography level="h2" color="primary" mb={4}>
        Game settings
      </Typography>
      {isAdmin ? (
        <Box component="form" mb={3} onSubmit={onSubmit}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Input
              placeholder="Paste Spotify playlist URL"
              sx={{ width: "100%", maxWidth: 500 }}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button type="submit" color="success">
              Submit
            </Button>
          </Box>
          <Typography level="body-xs" marginTop={1}>
            Do not attempt to use the the playlists created by Spotify, as they
            have been blocked by recent Web API update
          </Typography>
        </Box>
      ) : (
        <></>
      )}

      {game.playlist ? (
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
              src={game?.playlist?.image_url}
              alt="Playlist cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>
          <Box>
            <Typography level="h2" color="primary">
              {game.playlist?.name}
            </Typography>
            <Typography>Owner: {game?.playlist?.owner}</Typography>
            <Typography>Track count: {game?.playlist?.tracks_total}</Typography>
          </Box>
        </Card>
      ) : (
        <Typography color="neutral">
          Once the playlist will be selected it's details will be displayed
          here.
        </Typography>
      )}
      <Divider sx={{ marginTop: 4, marginBottom: 4, maxWidth: 640 }}></Divider>

      <Box sx={{ maxWidth: 640 }}>
        <Typography level="h3" color="primary" marginBottom={2}>
          Rules
        </Typography>
        {game?.playlist ? (
          isAdmin ? (
            <AdminGameRules />
          ) : (
            <UserGameRules />
          )
        ) : (
          <Typography color="neutral">
            Playlist must be selected in order to specify the game rules
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default PlaylistSelect;

// https://open.spotify.com/playlist/61jNo7WKLOIQkahju8i0hw?si=6651c5d5713145dd
