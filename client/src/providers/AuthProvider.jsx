import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import NotificationContext, {
  CustomNotification,
} from "./NotificationProvider";
// @ts-ignore
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AuthContext = createContext({
  user: {},
  loading: true,
  token: null,
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // UseEffect double execution prevention
  const executedRef = useRef(false);

  const { addNotification } = useContext(NotificationContext);

  // After the spotify callback is served, the redirection to the FE is made.
  // The sid parameter passed within the URL query can be used to retrieve the specific Spotify Web API token from the BE
  const retrieveSessionIdfromURL = function () {
    const params = new URLSearchParams(window.location.search);
    return params.get("sid");
  };

  // Exchange sid request param for HttpOnly cookie with Spotify API token
  const exchangeSessionForToken = useCallback(
    async (sid) => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/set-api-token`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sid }),
        });
        if (!res.ok) throw new Error("Failed to exchange Spotify token");

        addNotification(
          new CustomNotification("success", "Spotify login successful")
        );
      } catch (err) {
        console.error(err);
        addNotification(new CustomNotification("error", err.message));
      }
    },
    [addNotification]
  );

  // Read the HTTP only Spotify API key cookie and return it within the response body
  const fetchSpotifyToken = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/spotify-token`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error();
      }
      const { token } = await res.json();
      return token;
    } catch {
      const errorMsg = "Failed to retrieve Spotify token";
      addNotification(new CustomNotification("error", errorMsg));
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Load current Spotify user profile */
  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/me`, {
        credentials: "include",
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error == "NO_TOKEN_PRESENT") {
          return;
        }
        throw new Error("Unauthenticated");
      }

      setUser(data);

      const jsToken = await fetchSpotifyToken();
      setToken(jsToken);
    } catch (err) {
      setUser(null);
      setToken(null);
      addNotification(new CustomNotification("error", err.message));
    } finally {
      setLoading(false);
    }
  }, [addNotification, fetchSpotifyToken]);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;
    (async () => {
      try {
        const sid = retrieveSessionIdfromURL();
        if (sid) {
          console.log("[AUTH] Found session ID from redirect:", sid);
          await exchangeSessionForToken(sid);
          // remove sid from URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
        await refreshUser();
      } catch (err) {
        console.error("[AUTH] Error when refreshing user", err);
        addNotification(
          new CustomNotification(
            "error",
            "An error occured when refreshing user"
          )
        );

        setUser(null);
        setToken(null);
        setLoading(false);
      }
    })();
  }, [addNotification, exchangeSessionForToken, refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, token, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
