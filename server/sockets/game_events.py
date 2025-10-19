from flask_socketio import emit, join_room, leave_room
from models.game_store import game_rooms

def register_socket_events(socketio):
    @socketio.on("connect")
    def on_connect():
        print("[SocketIO] Client connected")

    @socketio.on("join_room")
    def on_join(data):
        room_id = data.get("room_id")
        user_name = data.get("user_name")
        if not room_id:
            emit("error", {"message": "Missing room_id"})
            return
        join_room(room_id)
        print(f"[SocketIO] {user_name} joined {room_id}")
        emit("user_joined", {"user_name": user_name, "room_id": room_id}, room=room_id)

    @socketio.on("leave_room")
    def on_leave(data):
        room_id = data.get("room_id")
        user_name = data.get("user_name")
        leave_room(room_id)
        print(f"[SocketIO] {user_name} left {room_id}")
        room = game_rooms.get(room_id)
        if room:
            room["players"] = [p for p in room["players"] if p["email"] != user_name]
            if not room["players"]:
                del game_rooms[room_id]
        emit("user_left", {"user_name": user_name, "room_id": room_id}, room=room_id)