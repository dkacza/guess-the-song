import { createContext, useContext, useEffect, useReducer } from "react";
import AuthContext from "./AuthProvider";
import { useSocket } from "../hooks/useSocket";
import { useGameApi } from "../hooks/useGameApi";
import { useNavigate } from "react-router-dom";

const LOCAL_STORAGE_GAME_ID_KEY = "game_id";

const GameContext = createContext({});

const initialState = {
  game: null,
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_GAME":
      return {
        ...state,
        game: action.payload,
      };
    case "RESET_GAME":
      return initialState;
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

function extractPlaylistId(url) {
  const match = url.match(/playlist[/:]([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

export function GameProvider({ children }) {
  const { user } = useContext(AuthContext);
  const { createGame, fetchGame, joinGame, deleteGame, setPlaylist, setRules } =
    useGameApi();
  const [state, dispatch] = useReducer(reducer, initialState);

  const navigate = useNavigate();

  const isAdmin = state.game?.host === user?.id;

  const socket = useSocket({
    user_joined: async (data) => {
      console.log("[SOCKET] user_joined:", data);
      const updatedGame = await fetchGame(data.room_id);
      dispatch({ type: "SET_GAME", payload: updatedGame });
    },
    game_deleted: () => {
      console.log("[SOCKET] game_deleted");
      localStorage.removeItem(LOCAL_STORAGE_GAME_ID_KEY);
      dispatch({ type: "RESET_GAME" });
      navigate("/");
    },
    user_left: async (data) => {
      console.log("[SOCKET] user left");
      const updatedGame = await fetchGame(data.room_id);
      dispatch({ type: "SET_GAME", payload: updatedGame });
    },
    playlist_set: async (data) => {
      console.log("[SOCKET] playlist set");
      const updatedGame = await fetchGame(data.room_id);
      dispatch({ type: "SET_GAME", payload: updatedGame });
    },
    rules_updated: async (data) => {
      console.log("[SOCKET] rules_updated:", data.rules);
      const updatedGame = await fetchGame(data.room_id);
      dispatch({
        type: "SET_GAME",
        payload: { ...state.game, rules: updatedGame.rules },
      });
    },
    game_ready: async (data) => {
      console.log("[SOCKET] game_ready:", data);
      const updatedGame = await fetchGame(data.room_id);
      dispatch({
        type: "SET_GAME",
        payload: updatedGame,
      });
      navigate("/game/" + updatedGame.room_id);
    },
    round_started: async (data) => {
      console.log("[SOCKET] round_started: ", data);
      const updatedGame = await fetchGame(data.room_id);
      dispatch({
        type: "SET_GAME",
        payload: updatedGame,
      });
    },
    round_summary: async (data) => {
      console.log("[SOCKET] round_summary", data);
      const updatedGame = await fetchGame(data.room_id);
      dispatch({
        type: "SET_GAME",
        payload: updatedGame,
      });
    },
  });

  // Current game is persisted in local storage
  useEffect(() => {
    const storedGameId = localStorage.getItem(LOCAL_STORAGE_GAME_ID_KEY);
    if (storedGameId) {
      fetchGame(storedGameId)
        .then((data) => {
          dispatch({ type: "SET_GAME", payload: data });
          socket.emit("join_room", {
            room_id: storedGameId,
            user_name: user.email,
          });
        })
        .catch(() => {
          // If game not present on the backend delete the entry and reset the state
          console.log("Game not found on the server - resetting");
          localStorage.removeItem(LOCAL_STORAGE_GAME_ID_KEY);
          dispatch({ type: "RESET_GAME" });
          navigate("/");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateGame() {
    let game = null;
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const data = await createGame();
      dispatch({ type: "SET_GAME", payload: data });
      localStorage.setItem(LOCAL_STORAGE_GAME_ID_KEY, data.room_id);
      socket.emit("join_room", {
        room_id: data.room_id,
        user_name: user.email,
      });
      game = data;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
    return game;
  }

  async function handleJoinGame(accessCode) {
    try {
      const data = await joinGame(accessCode);
      console.log(data);
      dispatch({ type: "SET_GAME", payload: data });
      localStorage.setItem(LOCAL_STORAGE_GAME_ID_KEY, data.room_id);

      socket.emit("join_room", {
        room_id: data.room_id,
        user_name: user.email,
      });

      return data;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  }

  async function handleDeleteGame() {
    if (!state?.game?.room_id) return;
    await deleteGame(state.game.room_id);
    localStorage.removeItem(LOCAL_STORAGE_GAME_ID_KEY);
    dispatch({ type: "RESET_GAME" });
  }

  async function handleLeaveGame() {
    socket.emit("leave_room", {
      room_id: state.game.room_id,
      user_name: user.email,
    });
    localStorage.removeItem(LOCAL_STORAGE_GAME_ID_KEY);
    dispatch({ type: "RESET_GAME" });
  }

  async function handleSetPlaylist(url) {
    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      dispatch({ type: "SET_ERROR", payload: "Invalid Spotify playlist URL" });
      return;
    }

    if (!state.game?.room_id) {
      dispatch({ type: "SET_ERROR", payload: "No active game found" });
      return;
    }
    console.log(playlistId);

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const updatedGame = await setPlaylist(state.game.room_id, playlistId);
      dispatch({ type: "SET_GAME", payload: updatedGame });
    } catch (err) {
      console.error(err);
      dispatch({ type: "SET_ERROR", payload: err.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }

  async function handleSetRules(rules) {
    if (!state.game?.room_id) return;
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const updatedGame = await setRules(state.game.room_id, rules);
      dispatch({ type: "SET_GAME", payload: updatedGame });
    } catch (err) {
      console.error(err);
      dispatch({ type: "SET_ERROR", payload: err.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }

  async function handleStartGame() {
    console.log("Emmiting start game event");
    socket.emit("start_game", {
      room_id: state.game.room_id,
      user_id: user.id,
    });
  }

  async function handleCommenceRound() {
    console.log("Emmiting commence round event");
    socket.emit("commence_round", {
      room_id: state.game.room_id,
    });
  }

  async function handleUserGuess(guess, elapsedMs) {
    console.log("Emmiting user guess event");
    socket.emit("user_guess", {
      room_id: state.game.room_id,
      user_id: user.id,
      elapsed_time: elapsedMs,
      guess,
    });
  }

  return (
    <GameContext.Provider
      value={{
        ...state,
        isAdmin,
        handleCreateGame,
        handleJoinGame,
        handleDeleteGame,
        handleLeaveGame,
        handleSetPlaylist,
        handleSetRules,
        handleStartGame,
        handleCommenceRound,
        handleUserGuess,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
export default GameContext;
