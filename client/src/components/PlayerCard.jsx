import { Avatar, Box, Card, IconButton, Typography } from "@mui/joy";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useContext } from "react";
import AuthContext from "../providers/AuthProvider";
import PersonIcon from "@mui/icons-material/Person";

function PlayerCard({ user, onRemove }) {
  const { user: loggedInUser } = useContext(AuthContext);

  return (
    <Card
      className="player-card"
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        py: 1,
        px: 2,
        minWidth: 400,
      }}
    >
      <Avatar>{user.display_name.charAt(0).toUpperCase()}</Avatar>

      <Box sx={{ ml: 2 }}>
        <Typography level="h4" color="primary">
          {user.display_name}
        </Typography>
        <Typography color="neutral">{user.email}</Typography>
      </Box>

      {user?.email != loggedInUser?.email ? (
        <IconButton
          color="danger"
          variant="outlined"
          sx={{ ml: "auto" }}
          onClick={() => onRemove?.(user)}
        >
          <RemoveCircleOutlineIcon />
        </IconButton>
      ) : (
        <PersonIcon sx={{ ml: "auto" }} />
      )}
    </Card>
  );
}

export default PlayerCard;
