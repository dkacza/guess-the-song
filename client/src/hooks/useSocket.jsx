import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

// @ts-ignore
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useSocket(eventHandlers = {}) {
  const socketRef = useRef(null);

  if (!socketRef.current) {
    socketRef.current = io(`${BACKEND_URL}`, {
      withCredentials: true,
      transports: ["websocket"],
      secure: true,
    });
  }

  useEffect(() => {
    const socket = socketRef.current;

    socket.on("connect", () => console.log("[SOCKET] Connected:", socket.id));
    socket.on("disconnect", () => console.log("[SOCKET] Disconnected"));

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      if (typeof handler === "function") socket.on(event, handler);
    });

    return () => {
      Object.keys(eventHandlers).forEach((event) => socket.off(event));
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [eventHandlers]);

  return socketRef.current;
}
