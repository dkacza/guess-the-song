import { Box, Button, Typography } from "@mui/joy";
import Navbar from "../components/Navbar";
import { useContext } from "react";
import AuthContext from "../providers/AuthProvider";
import { PulseLoader } from "react-spinners";
import { Navigate } from "react-router-dom";
import GameContext from "../providers/GameProvider";
import InterRoundPanel from "../components/InterRoundPanel";
import RoundPanel from "../components/RoundPanel";

const containerStyles = {
  width: "100vw",
  height: "100vh",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
};

const mainContentStyles = {
  display: "flex",
  flexGrow: 1,
  justifyContent: "center",
  width: "100vw",
};

function GameView() {
  const { user, loading } = useContext(AuthContext);
  // @ts-ignore
  const { game } = useContext(GameContext);

  let panel = <></>;
  if (game?.status == "ready") {
    panel = <InterRoundPanel />;
  } else {
    panel = <RoundPanel />;
  }

  console.log(game);

  return (
    <Box className="app-wrapper" sx={containerStyles}>
      <Navbar></Navbar>
      <Box sx={mainContentStyles}>
        {loading ? (
          <PulseLoader color="#1976d2" size={12} margin={6} />
        ) : user ? (
          panel
        ) : (
          <Navigate to="/" />
        )}
      </Box>
    </Box>
  );
}

export default GameView;
