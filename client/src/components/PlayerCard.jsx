import { Avatar, Box, Card, IconButton, Typography } from "@mui/joy";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

function PlayerCard({ user, onRemove }) {
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
      <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>

      <Box sx={{ ml: 2 }}>
        <Typography level="h4" color="primary">
          {user.name}
        </Typography>
        <Typography color="neutral">{user.email}</Typography>
      </Box>

      <IconButton
        color="danger"
        variant="outlined"
        sx={{ ml: "auto" }}
        onClick={() => onRemove?.(user)}
      >
        <RemoveCircleOutlineIcon />
      </IconButton>
    </Card>
  );
}

export default PlayerCard;
