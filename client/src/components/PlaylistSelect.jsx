import {
  Box,
  Button,
  Card,
  Divider,
  Input,
  Slider,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import WebSDKDemo from "./WebSDKPlayer";
import WebSDKPlayer from "./WebSDKPlayer";

const containerStyling = {
  display: "flex",
  flexDirection: "column",
  width: "60vw",
  p: 4,
};

const extractPlaylistId = function (url) {
  const match = url.match(/playlist[/:]([A-Za-z0-9]+)/);
  return match ? match[1] : null;
};

function PlaylistSelect() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [url, setUrl] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    fetch("https://localhost:5000/api/token", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setToken(data?.access_token ?? null));
  }, []);

  const getPlaylistInfo = async (url) => {
    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      setError("Invalid playlist link");
      return;
    }

    setLoading(true);
    setError("");
    setPlaylist(null);

    try {
      const res = await fetch(
        `https://localhost:5000/api/playlist-info/${playlistId}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      console.log(data);
      setPlaylist(data);
    } catch (err) {
      console.error(err);
      setError("Could not retrieve playlist info");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    console.log("submitting: " + url);
    e.preventDefault(); // prevent page reload
    getPlaylistInfo(url);
  };

  return (
    <Box sx={containerStyling}>
      <Typography level="h2" color="primary" mb={4}>
        Game settings
      </Typography>
      <Box component="form" onSubmit={handleSubmit} mb={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Input
            placeholder="Paste Spotify playlist URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            sx={{ width: "100%", maxWidth: 500 }}
          />
          <Button
            type="submit"
            color="success"
            loading={loading}
            disabled={!url.trim()}
          >
            Submit
          </Button>
        </Box>
        {error && (
          <Typography level="body-sm" color="danger" mt={1}>
            {error}
          </Typography>
        )}
        <Typography level="body-xs" marginTop={1}>
          Do not attempt to use the the playlists created by Spotify, as they
          have been blocked by recent Web API update
        </Typography>
      </Box>
      {playlist ? (
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
              src={playlist?.images?.[0]?.url}
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
              {playlist?.name}
            </Typography>
            <Typography>Owner: {playlist?.owner?.display_name}</Typography>
            <Typography>Track count: {playlist?.tracks?.total}</Typography>
          </Box>
        </Card>
      ) : (
        <></>
      )}
      <Divider sx={{ marginTop: 4, marginBottom: 4, maxWidth: 640 }}></Divider>
      <Box sx={{ maxWidth: 640 }}>
        <Typography level="h3" color="primary" marginBottom={2}>
          Rules
        </Typography>
        <Typography>Rounds</Typography>
        <Slider aria-label="Always visible" defaultValue={10} />
        <Typography>Time per round</Typography>
        <Slider min={5} max={30} aria-label="Always visible" />
        <Typography>Time factor</Typography>
        <Slider
          min={0}
          max={1}
          step={0.1}
          aria-label="Always visible"
          defaultValue={0.5}
        />
      </Box>

      <Box className="web-sdk-demo" sx={{ mt: 4 }}>
        {playlist && <WebSDKPlayer token={token} playlistUri={playlist.uri} />}
      </Box>
    </Box>
  );
}

export default PlaylistSelect;

// https://open.spotify.com/playlist/61jNo7WKLOIQkahju8i0hw?si=6651c5d5713145dd
