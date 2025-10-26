import { useEffect } from "react";

export default function usePreventReload(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      const key = e.key?.toLowerCase();

      // F5 or Ctrl/Cmd + R
      const isRefresh =
        key === "f5" || ((e.ctrlKey || e.metaKey) && key === "r");

      if (isRefresh) {
        e.preventDefault();
        e.stopPropagation();
        alert("Please don't refresh! Your current round would be lost.");
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);
}
