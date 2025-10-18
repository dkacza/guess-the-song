import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Root from "./Root";
import { AuthProvider } from "./providers/AuthProvider";
import { GameProvider } from "./providers/GameProvider";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomeView from "./views/HomeView";
import "./index.css";
import LobbyView from "./views/LobbyView";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/room/:id" element={<LobbyView />} />
          </Routes>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
