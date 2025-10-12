import { Box, Typography } from "@mui/joy";
import Navbar from "../components/Navbar";
import SpotifyLogin from "../components/SpotifyLogin";
import AuthContext from "../providers/AuthProvider";
import { useContext } from "react";
import GameSelect from "../components/GameSelect";
import { PulseLoader } from "react-spinners";

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
  alignItems: "center",
};

function HomeView() {
  const { user, loading } = useContext(AuthContext);

  return (
    <Box className="app-wrapper" sx={containerStyles}>
      <Navbar></Navbar>
      <Box sx={mainContentStyles}>
        {loading ? (
          <PulseLoader color="#1976d2" size={12} margin={6} />
        ) : user ? (
          <GameSelect></GameSelect>
        ) : (
          <SpotifyLogin />
        )}
      </Box>
    </Box>
  );
}

export default HomeView;
