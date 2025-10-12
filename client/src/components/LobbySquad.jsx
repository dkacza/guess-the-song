import { DeleteOutline, StartOutlined } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/joy";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import PlayerCard from "./PlayerCard";
import { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const containerStyling = {
  display: "flex",
  flexDirection: "column",
  p: 4,
};

const mockUser = {
  name: "Dawid",
  email: "sample@email.com",
};

function LobbySquad() {
  const [copied, setCopied] = useState(false);
  const gameCode = "ABCD1234";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // hide popup after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  return (
    <Box sx={containerStyling}>
      <Box className="lobby-members">
        <Typography level="h2" color="primary" mb={4}>
          Lobby members
        </Typography>
        <Box
          sx={{
            maxHeight: 400,
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pr: 1,
          }}
        >
          <PlayerCard
            user={mockUser}
            onRemove={() => console.log("user remove")}
          />
          <PlayerCard
            user={mockUser}
            onRemove={() => console.log("user remove")}
          />
          <PlayerCard
            user={mockUser}
            onRemove={() => console.log("user remove")}
          />
        </Box>
      </Box>

      <Box
        sx={{
          mt: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<ContentCopyIcon />}
          onClick={handleCopyCode}
          sx={{
            gridColumn: "1 / span 2",
            justifySelf: "center",
            width: "100%",
          }}
        >
          Copy Access Code
        </Button>
        <Button color="danger" startDecorator={<DeleteOutline />}>
          Resolve lobby
        </Button>
        <Button color="success" startDecorator={<StartOutlined />}>
          Start the game
        </Button>
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        color="success"
        variant="soft"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        Game code copied to clipboard!
      </Snackbar>
    </Box>
  );
}

export default LobbySquad;
