import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomeView from "./views/HomeView";
import "./index.css";
import LobbyView from "./views/LobbyView";

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/lobby" element={<LobbyView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Root;
