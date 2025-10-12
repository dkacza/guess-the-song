import { createContext, useEffect, useState } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  refreshUser: () => Promise.resolve(),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // After the spotify callback is served, the redirection to the FE is made.
  // The sid parameter passed within the URL query can be used to retrieve the specific Spotify Web API token from the BE
  const retrieveSessionIdfromURL = function () {
    const params = new URLSearchParams(window.location.search);
    return params.get("sid");
  };

  const getSpotifyToken = async (sid) => {
    const res = await fetch("https://localhost:5000/api/set-api-token", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sid }),
    });
    if (!res.ok) throw new Error("Failed to set Spotify Web API token");
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("https://localhost:5000/api/me", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Not authenticated");

      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const sessionIdFromUrl = retrieveSessionIdfromURL();
      if (sessionIdFromUrl) {
        await getSpotifyToken(sessionIdFromUrl);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
      await refreshUser();
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
