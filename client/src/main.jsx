import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Root from "./Root";
import { AuthProvider } from "./providers/AuthProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);
