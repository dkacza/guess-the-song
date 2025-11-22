import React, { useEffect, useState } from "react";
import { Box, Card, Typography, Button } from "@mui/joy";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const cardStyling = {
  padding: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

function AdminComponent() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/game/rooms`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch rooms");
        const data = await res.json();
        setRooms(data.rooms || []);
      } catch (err) {
        console.error("Failed to retrieve rooms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const deleteRoom = (roomId) => {
    fetch(`${BACKEND_URL}/api/game/${roomId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => setRooms((prev) => prev.filter((r) => r.room_id !== roomId)))
      .catch((err) => console.error("Failed to delete room", err));
  };

  if (loading)
    return (
      <Typography level="h3" textAlign="center" mt={4}>
        Loading rooms...
      </Typography>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2" textAlign="center" mb={4} color="primary">
        Admin Game Rooms
      </Typography>

      {rooms.length === 0 ? (
        <Typography textAlign="center" color="neutral.500">
          No rooms found.
        </Typography>
      ) : (
        <Card sx={cardStyling}>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              "& th, & td": { border: "1px solid", borderColor: "neutral.300", padding: 1 },
              "& th": { backgroundColor: "neutral.100", textAlign: "left" },
              "& tr:hover": { backgroundColor: "neutral.100" },
            }}
          >
            <thead>
              <tr>
                <th>Room ID</th>
                <th>Host</th>
                <th>Players</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.room_id}>
                  <td>{room.room_id}</td>
                  <td>{room.host}</td>
                  <td>{room.players?.length || 0}</td>
                  <td>{room.status}</td>
                  <td>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => deleteRoom(room.room_id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Card>
      )}
    </Box>
  );
}

export default AdminComponent;
