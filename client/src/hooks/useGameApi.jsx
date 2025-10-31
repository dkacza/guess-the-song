// @ts-ignore
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useGameApi() {
  const API_BASE = `${BACKEND_URL}/api/game`;

  async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }

  return {
    createGame: () => apiFetch("/create", { method: "POST" }),
    fetchGame: (roomId) => apiFetch(`/${roomId}`),
    deleteGame: (roomId) => apiFetch(`/${roomId}`, { method: "DELETE" }),
    joinGame: (accessCode) =>
      apiFetch("/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: accessCode }),
      }),
    setPlaylist: (roomId, playlistId) =>
      apiFetch("/set-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, playlist_id: playlistId }),
      }),
    setRules: (roomId, rules) =>
      apiFetch("/set-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, rules }),
      }),
  };
}
