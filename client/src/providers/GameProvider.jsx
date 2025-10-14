import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import AuthContext from "./AuthProvider";

const GameContext = createContext({
  game: null,
  loading: false,
  error: null,
  activeGameId: null,
  isAdmin: false,
  createGame: () => Promise.resolve(),
  fetchGame: (gameId) => Promise.resolve(),
  joinGame: (accessCode) => Promise.resolve(),
  deleteGame: (gameId) => Promise.resolve(),
});

export function GameProvider({ children }) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeGameId, setActiveGameId] = useState(null);

  const { user } = useContext(AuthContext);

  const isAdmin = game?.host === user?.id;

  const socketRef = useRef(null);

  if (!socketRef.current) {
    socketRef.current = io("https://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
      secure: true,
    });
  }
  const socket = socketRef.current;

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
      setGame(data);
      localStorage.setItem("room_id", data.room_id);
      setActiveGameId(data.room_id);
      socket.emit("join_room", {
        room_id: data.room_id,
        user_name: user.email, // optional, if available
      });
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
    setGame(null);
    localStorage.removeItem("room_id");
    setActiveGameId(null);
    return data;
  };

  const joinGame = async (accessCode) => {
    try {
      const response = await fetch("https://localhost:5000/api/game/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ access_code: accessCode }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to join game");
      }

      const data = await response.json();
      setGame(data);
      localStorage.setItem("room_id", data.room_id);
      setActiveGameId(data.room_id);
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Load last room from localStorage (if page refreshed)
  useEffect(() => {
    const storedRoom = localStorage.getItem("room_id");
    if (storedRoom) {
      const getGameDetails = async () => {
        const data = await fetchGame(storedRoom);
        setActiveGameId(data.room_id);
        setGame(data);
      };
      getGameDetails();
    }
  }, []);

  useEffect(() => {
    const s = socketRef.current;

    s.on("connect", () => {
      console.log("[SOCKET] Connected:", s.id);
    });

    s.on("user_joined", async (data) => {
      console.log("[SOCKET] New user joined:", data.user_name);

      // optionally refresh room data:
      const room_id = data.room_id;
      const updatedGame = await fetchGame(room_id);
      setGame(updatedGame);
    });

    s.on("disconnect", () => {
      console.log("[SOCKET] Disconnected");
    });

    return () => {
      s.off("user_joined");
      s.off("connect");
      s.off("disconnect");
    };
  }, []);

  return (
    <GameContext.Provider
      value={{
        game,
        loading,
        error,
        activeGameId,
        isAdmin,
        createGame,
        fetchGame,
        deleteGame,
        joinGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
export default GameContext;
