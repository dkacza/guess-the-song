import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./providers/AuthProvider";
import { GameProvider } from "./providers/GameProvider";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomeView from "./views/HomeView";
import "./index.css";
import LobbyView from "./views/LobbyView";
import GameView from "./views/GameView";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <GameProvider>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/room/:id" element={<LobbyView />} />
            <Route path="/game/:id" element={<GameView />} />
          </Routes>
        </GameProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
