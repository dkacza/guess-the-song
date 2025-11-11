import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";

  return {
    plugins: [react()],
    server: isDevelopment
      ? {
          https: {
            key: fs.readFileSync("./localhost+2-key.pem"),
            cert: fs.readFileSync("./localhost+2.pem"),
          },
          port: 5173,
          proxy: {
            "/auth": "https://localhost:5000",
            "/api": "https://localhost:5000",
          },
        }
      : { port: 5173 },
  };
});