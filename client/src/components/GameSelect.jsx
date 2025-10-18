import { Box, Button, Card, Input, Link, Typography } from "@mui/joy";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import GameContext, { GameProvider } from "../providers/GameProvider";

const containerStyling = {};
const cardStyling = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: 400,
  paddingTop: 4,
  paddingBottom: 4,
};

function GameSelect() {
  const navigate = useNavigate();
  // @ts-ignore
  const { handleJoinGame, handleCreateGame, game } = useContext(GameContext);
  const [accessCode, setAccessCode] = useState("");

  return (
    <Box sx={containerStyling}>
      <Typography level="h2" color="primary" mb={8} textAlign="center">
        Let's get the game started!
      </Typography>
      <Box sx={{ display: "flex", gap: 8 }}>
        <Card sx={cardStyling}>
          <Typography level="h3" color="primary">
            Create new lobby
          </Typography>
          <AddCircleOutlineIcon color="primary" sx={{ fontSize: 100 }} />
          <Typography textAlign="center" mb={2}>
            Start an entirely new game.{<br></br>} You select the playlist and
            the rules.
          </Typography>
          <Button
            color="success"
            onClick={async () => {
              const newGame = await handleCreateGame();
              navigate("/room/" + newGame?.room_id);
            }}
          >
            New Game
          </Button>
        </Card>
        <Card sx={cardStyling}>
          <Typography level="h3" color="primary">
            Join existing lobby
          </Typography>
          <MeetingRoomIcon color="primary" sx={{ fontSize: 100 }} />
          <Typography textAlign="center" mb={2}>
            Your friend has already started the game? {<br></br>} Ask him to
            provide you the code to enter it.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 0.5 }}>
            <Input
              placeholder="Game Code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            ></Input>
            <Button
              onClick={async () => {
                const newGame = await handleJoinGame(accessCode);
                console.log(newGame);
                navigate("/room/" + newGame?.room_id);
              }}
              color="success"
            >
              Join
            </Button>
          </Box>
        </Card>
      </Box>
      {game?.room_id ? (
        <Box sx={{ mt: 4 }}>
          <Typography>
            There's a room that you have already been part of recently.
          </Typography>
          <Link
            onClick={() => {
              navigate("/room/" + game?.room_id);
            }}
          >
            Click to join
          </Link>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
}

export default GameSelect;
