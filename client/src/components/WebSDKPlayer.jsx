import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/joy";

const SDK_URL = "https://sdk.scdn.co/spotify-player.js";

export default function WebSDKPlayer({ token, playlistUri }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(true);
  const [track, setTrack] = useState(null);

  // --- Initialize Spotify player ---
  useEffect(() => {
    if (!token) return;

    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const _player = new window.Spotify.Player({
        name: "Guess‑the‑Song Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.7,
      });

      setPlayer(_player);

      _player.addListener("ready", ({ device_id }) => {
        console.log("Device ready:", device_id);
        setDeviceId(device_id);
        setReady(true);
      });

      _player.addListener("not_ready", ({ device_id }) => {
        console.log("Device offline:", device_id);
        setReady(false);
      });

      _player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setPaused(state.paused);
        setTrack(state.track_window.current_track);
      });

      _player.addListener("initialization_error", ({ message }) =>
        console.error("Init error:", message)
      );
      _player.addListener("authentication_error", ({ message }) =>
        console.error("Auth error:", message)
      );
      _player.addListener("account_error", ({ message }) =>
        console.error("Account error:", message)
      );

      _player.connect();
    };

    return () => {
      if (player) player.disconnect();
    };
  }, [token]);

  // --- Playback control helpers ---
  const startPlaylist = async () => {
    if (!deviceId || !playlistUri) return;
    const playlistId = playlistUri.match(/playlist[:/](\w+)/)?.[1];
    const uri = `spotify:playlist:${playlistId}`;
    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        body: JSON.stringify({ context_uri: uri }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const togglePlay = async () => {
    if (player) await player.togglePlay();
  };

  const skipToNext = async () => {
    if (player) await player.nextTrack();
  };

  const skipToPrev = async () => {
    if (player) await player.previousTrack();
  };

  // --- UI ---
  return (
    <Box
      sx={{
        mt: 4,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
      }}
    >
      <Typography level="h4" mb={1}>
        Spotify Web Player {ready ? "✅ Connected" : "Connecting…"}
      </Typography>

      {track && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mt: 1,
            mb: 2,
          }}
        >
          <img
            src={track.album?.images?.[0]?.url}
            alt={track.name}
            style={{
              width: 80,
              height: 80,
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
          <Box>
            <Typography level="title-md">{track.name}</Typography>
            <Typography level="body-sm" textColor="text.tertiary">
              {track.artists?.map((a) => a.name).join(", ")}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          onClick={startPlaylist}
          disabled={!ready}
          color="success"
          variant="solid"
        >
          Start Playlist
        </Button>
        <Button onClick={togglePlay} disabled={!ready}>
          {paused ? "Play" : "Pause"}
        </Button>
        <Button onClick={skipToPrev} disabled={!ready}>
          ⏮ Prev
        </Button>
        <Button onClick={skipToNext} disabled={!ready}>
          ⏭ Next
        </Button>
      </Box>
    </Box>
  );
}
