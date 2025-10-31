// @ts-nocheck
import { createContext, useContext, useEffect, useState, useRef } from "react";
import AuthContext from "./AuthProvider";

const SDK_URL = "https://sdk.scdn.co/spotify-player.js";

const SpotifyContext = createContext({
  deviceId: null,
  pauseTrack: async () => {},
  nextTrack: async () => {},
});

export function SpotifyProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const initializedRef = useRef(false);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token || initializedRef.current) return;
    initializedRef.current = true;

    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const _player = new window.Spotify.Player({
        name: "Guess‑the‑Song Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.7,
      });

      _player.addListener("ready", ({ device_id }) => {
        console.log("[SPOTIFY] Ready:", device_id);
        setDeviceId(device_id);
        setReady(true);
      });

      _player.addListener("not_ready", ({ device_id }) => {
        console.warn("[SPOTIFY] Device offline", device_id);
        setReady(false);
      });

      _player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setPaused(state.paused);
        setCurrentTrack(state.track_window.current_track);
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
      setPlayer(_player);
    };

    return () => {
      if (player) player.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const playTrack = async (track) => {
    try {
      if (!ready || !deviceId || !track?.uri) return;

      const res = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ uris: [track.uri] }),
        }
      );
      if (!res.ok) throw await res.text();
      console.log("[SPOTIFY] Playing:", track.name);
    } catch (err) {
      console.error("Failed to play track", err);
    }
  };

  const togglePlay = async () => player && player.togglePlay();
  const nextTrack = async () => player && player.nextTrack();
  const prevTrack = async () => player && player.previousTrack();
  const setVolume = async (v) => player && player.setVolume(v);
  const pauseTrack = async () => player && player.pause();

  return (
    <SpotifyContext.Provider
      value={{
        player,
        deviceId,
        ready,
        paused,
        currentTrack,
        pauseTrack,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}
export default SpotifyContext;
