import { createContext, useEffect, useState } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  refreshUser: () => Promise.resolve(),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sessionIdFromUrl = retrieveSessionIdfromURL();
      if (sessionIdFromUrl) {
        await getSession(sessionIdFromUrl);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
      await refreshUser();
    })();
  }, []);

  const retrieveSessionIdfromURL = function () {
    const params = new URLSearchParams(window.location.search);
    return params.get("sid");
  };

  const getSession = async (sessionIdFromUrl) => {
    const res = await fetch("https://localhost:5000/api/set-session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionIdFromUrl }),
    });
    if (!res.ok) throw new Error("failed to set session");
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

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
