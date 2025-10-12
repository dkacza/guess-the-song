import { Box } from "@mui/joy";
import Navbar from "../components/Navbar";
import { useContext } from "react";
import AuthContext from "../providers/AuthProvider";
import { PulseLoader } from "react-spinners";
import { Navigate } from "react-router-dom";
import PlaylistSelect from "../components/PlaylistSelect";
import LobbySquad from "../components/LobbySquad";

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

function LobbyView() {
  const { user, loading } = useContext(AuthContext);

  return (
    <Box className="app-wrapper" sx={containerStyles}>
      <Navbar></Navbar>
      <Box sx={mainContentStyles}>
        {loading ? (
          <PulseLoader color="#1976d2" size={12} margin={6} />
        ) : user ? (
          <Box
            sx={{
              display: "flex",
              width: "100vw",
              justifyContent: "space-between",
              pr: 10,
            }}
          >
            <PlaylistSelect />
            <LobbySquad />
          </Box>
        ) : (
          <Navigate to="/home" />
        )}
      </Box>
    </Box>
  );
}

export default LobbyView;
