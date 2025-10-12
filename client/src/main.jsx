import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Root from "./Root";
import { AuthProvider } from "./providers/AuthProvider";
import { GameProvider } from "./providers/GameProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <GameProvider>
        <Root />
      </GameProvider>
    </AuthProvider>
  </StrictMode>
);
