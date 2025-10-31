import { Box, Sheet, Table, Typography } from "@mui/joy";
import { useContext } from "react";
import GameContext from "../providers/GameProvider";

function Leaderboard() {
  // @ts-ignore
  const { game } = useContext(GameContext);
  const players = game?.players || [];
  const scoreboard = game?.scoreboard || {};

  const rows = players.map((player) => {
    return {
      name: player.display_name || player.email,
      totalScore: scoreboard[player.id] ?? 0,
    };
  });

  const sorted = [...rows].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <Box sx={{ width: "100%", maxWidth: 720, mx: "auto", mt: 4 }}>
      <Typography level="h3" color="primary" mb={2}>
        Leaderboard
      </Typography>

      <Sheet
        variant="outlined"
        sx={{
          overflow: "auto",
          boxShadow: "sm",
        }}
      >
        <Table
          stickyHeader
          hoverRow
          noWrap
          borderAxis="bothBetween"
          sx={{
            "& thead th": {
              bgcolor: "neutral.softBg",
              fontWeight: "md",
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>User Name</th>
              <th>Total Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={row.id}>
                <td>{i + 1}</td>
                <td>{row.name}</td>
                <td>
                  <Typography fontWeight="lg">{row.totalScore}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </Box>
  );
}

export default Leaderboard;
