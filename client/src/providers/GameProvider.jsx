import { createContext, useEffect, useState } from "react";

const GameContext = createContext({
  room: null,
  loading: false,
  error: null,
  activeRoomId: null,
  createGame: () => Promise.resolve(),
  fetchGame: (roomId) => Promise.resolve(),
  deleteGame: (roomId) => Promise.resolve(),
});

export function GameProvider({ children }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);

  const createGame = async () => {
    console.log("creating game");
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("https://localhost:5000/api/game/create", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create game");
      const data = await res.json();
      setRoom(data);
      localStorage.setItem("room_id", data.room_id);
      setActiveRoomId(data.room_id);
      console.log("New Game:");
      console.log(data);
      return data;
    } catch (err) {
      console.error(err);
      setError("Could not create game");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  async function fetchGame(roomId) {
    const res = await fetch(`https://localhost:5000/api/game/${roomId}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load room");
    return data;
  }

  const deleteGame = async (roomId) => {
    const res = await fetch(`https://localhost:5000/api/game/${roomId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete game");
    const data = await res.json();
    setRoom(null);
    localStorage.removeItem("room_id");
    setActiveRoomId(null);
    return data;
  };

  // Load last room from localStorage (if page refreshed)
  useEffect(() => {
    const storedRoom = localStorage.getItem("room_id");
    if (storedRoom) {
      const getGameDetails = async () => {
        const data = await fetchGame(storedRoom);
        setActiveRoomId(data.room_id);
        setRoom(data);
      };
      getGameDetails();
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        room,
        loading,
        error,
        activeRoomId,
        createGame,
        fetchGame,
        deleteGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
export default GameContext;
