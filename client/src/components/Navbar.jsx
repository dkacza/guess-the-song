import { Box, Button, IconButton, Sheet, Typography } from "@mui/joy";
import { useContext } from "react";
import AuthContext from "../providers/AuthProvider";
import { FaSpotify } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LogoutRounded } from "@mui/icons-material";

const containerStyling = {
  borderBottom: "1px solid",
  borderColor: "divider",
  display: "flex",
  flexDirection: "row",
  p: 2,
  justifyContent: "space-between",
  alignItems: "center",
  minHeight: 86,
};

function Navbar() {
  const { user, showAdmin, handleLogout, setShowAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Sheet variant="outlined" sx={containerStyling}>
      <Typography
        level="h2"
        color="success"
        ml={2}
        onClick={() => navigate("/")}
        sx={{ cursor: "pointer" }}
      >
        Guess-the-song!
      </Typography>
      <Box>
        <Button color="primary" onClick={() => setShowAdmin((prev) => !prev)} variant="outlined" >
                Switch to {showAdmin ? "User View" : "Admin View"}
          </Button>
      </Box>
      {user ? (
        <Box mr={5} sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          <FaSpotify size={36} color="#1DB954" />
          <Box>
            <Typography level="h4" color="primary">
              {user?.display_name}
            </Typography>
            <Typography level="body-sm">{user?.email}</Typography>
          </Box>
          <IconButton color="danger" onClick={handleLogout}>
            <LogoutRounded></LogoutRounded>
          </IconButton>
        </Box>
      ) : (
        <></>
      )}
    </Sheet>
  );
}

export default Navbar;
