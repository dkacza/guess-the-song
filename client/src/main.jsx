import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./providers/AuthProvider";
import { GameProvider } from "./providers/GameProvider";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomeView from "./views/HomeView";
import "./index.css";
import LobbyView from "./views/LobbyView";
import GameView from "./views/GameView";
import { SpotifyProvider } from "./providers/SpotifyProvider";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { NotificationProvider } from "./providers/NotificationProvider";
import StatusNotifications from "./components/StatusNotifications";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CssVarsProvider>
      <CssBaseline>
        <NotificationProvider>
          <AuthProvider>
            <SpotifyProvider>
              <BrowserRouter>
                <GameProvider>
                  <Routes>
                    <Route path="/" element={<HomeView />} />
                    <Route path="/room/:id" element={<LobbyView />} />
                    <Route path="/game/:id" element={<GameView />} />
                  </Routes>
                </GameProvider>
              </BrowserRouter>
              <StatusNotifications />
            </SpotifyProvider>
          </AuthProvider>
        </NotificationProvider>
      </CssBaseline>
    </CssVarsProvider>
  </StrictMode>
);
