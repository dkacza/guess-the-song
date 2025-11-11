import { Box, Sheet, Table, Typography } from "@mui/joy";
import { useContext } from "react";
import GameContext from "../providers/GameProvider";

function Leaderboard() {
  // @ts-ignore
  const { game } = useContext(GameContext);
  const players = game?.players || [];
  const scoreboard = game?.scoreboard || {};
  const roundSummary = game?.round_results || {};

  const rows = players.map((player) => {
    return {
      name: player.display_name || player.email,
      totalScore: scoreboard[player.id] ?? 0,
      roundPoints: roundSummary[player.id]?.round_points || 0,
      titleGuess: roundSummary[player.id]?.title_guess || "-",
      titlePoints: roundSummary[player.id]?.title_points || 0,
      artistGuess: roundSummary[player.id]?.artist_guess || "-",
      artistPoints: roundSummary[player.id]?.artist_points || 0,
      guessTime: roundSummary[player.id]?.guess_time || 0,
    };
  });

  const sorted = [...rows].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <Box sx={{ width: "100%", minWidth: 920, mx: "auto", mt: 4 }}>
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
              <th>Pos.</th>
              <th>User Name</th>
              <th>Total Score</th>
              <th>Round Score</th>
              <th>Title Guess</th>
              <th>Title Score</th>
              <th>Artist Guess</th>
              <th>Aritst Score</th>
              <th>Guess time</th>
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
                <td>{row.roundPoints} / 100</td>
                <td>{row.titleGuess}</td>
                <td>{row.titlePoints} / 70</td>
                <td>{row.artistGuess}</td>
                <td>{row.artistPoints} / 30</td>
                <td>{(row.guessTime || 0) / 1000} s</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </Box>
  );
}

export default Leaderboard;
