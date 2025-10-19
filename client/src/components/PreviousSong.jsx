import { Box, Card, Typography } from "@mui/joy";

function PreviousSong() {
  return (
    <Card sx={{ display: "flex", flexDirection: "row", maxWidth: 600 }}>
      <Box
        sx={{
          width: 120,
          height: 120,
          flexShrink: 0,
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <img
          src="DUPA"
          alt="Album cover"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </Box>
      <Box>
        <Typography level="h2" color="primary">
          Song name
        </Typography>
        <Typography>Artist: </Typography>
        <Typography>Album:</Typography>
      </Box>
    </Card>
  );
}

export default PreviousSong;
