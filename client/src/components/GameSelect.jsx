import { Box, Button, Card, Input, Typography } from "@mui/joy";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { useNavigate } from "react-router-dom";

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
            onClick={() => {
              navigate("/lobby");
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
            <Input placeholder="Game Code"></Input>
            <Button
              onClick={() => {
                navigate("/lobby");
              }}
              color="success"
            >
              Join
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

export default GameSelect;
