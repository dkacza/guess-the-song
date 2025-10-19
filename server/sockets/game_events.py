from flask_socketio import emit, join_room, leave_room
from models.game_store import game_rooms, initialize_game
from threading import Timer
from sockets.socket import socketio


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


    @socketio.on("start_game")
    def start_game(data):
        room_id = data.get("room_id")
        user_id = data.get("user_id")

        room = game_rooms.get(room_id)
        if not room or room["host"] != user_id:
            emit("error", {"msg": "Only host can start the game"})
            return

        initialize_game(room_id)
        emit("game_ready", {"room_id": room_id, "room": room["rules"]}, room=room_id)
        print(f"[GAME] Game ready in room {room_id}")


    @socketio.on("commence_round")
    def commence_round(data):
        room_id = data.get("room_id")
        room = game_rooms.get(room_id)
        if not room:
            return

        round_index = room["round_index"]
        if round_index >= len(room["subplaylist"]):
            socketio.emit("game_finished", {"scoreboard": room["scoreboard"]}, room=room_id)
            room["status"] = "finished"
            return

        current_track = room["subplaylist"][round_index]
        room["current_track"] = current_track
        room["guesses"] = {}
        room["status"] = "round_active"

        print(f"[ROUND] Starting round {round_index + 1}/{len(room['subplaylist'])}")
        socketio.emit(
            "round_started",
            {"room_id": room_id, "round": round_index + 1, "track": current_track},
            room=room_id,
        )
        print(f"[DEBUG] socketio id in app.py = {id(socketio)}")

        # Start timeout
        duration = room["rules"]["time_per_round"]
        socketio.start_background_task(end_round, room_id)

    @socketio.on("user_guess")
    def user_guess(data):
        room_id = data.get("room_id")
        user_id = data.get("user_id")
        guess = data.get("guess")
        elapsed = data.get("elapsed_time", 0)

        room = game_rooms.get(room_id)
        if not room or room["status"] != "round_active":
            return

        room["guesses"][user_id] = {"guess": guess, "elapsed": elapsed}

        # Check if all have guessed
        if len(room["guesses"]) == len(room["players"]):
            end_round(room_id)

def end_round(room_id):
    socketio.sleep(5)
    room = game_rooms.get(room_id)
    if not room or room.get("status") != "round_active":
        return

    print(f"[ROUND] Ending round for {room_id}")
    room["status"] = "round_summary"

    correct_track = room["current_track"]
    round_results = []

    for player in room["players"]:
        pid = player["id"]
        guess = room["guesses"].get(pid)
        correct = guess and guess["guess"] == correct_track
        base_points = 100 if correct else 0
        bonus = 0
        if correct:
            time_factor = room["rules"].get("speed_factor", 0.5)
            bonus = int(((30 - guess["elapsed"]) / 30) * 100 * time_factor)
        points = base_points + bonus
        room["scoreboard"][pid] += points
        round_results.append(
            {"player": pid, "correct": correct, "points": points}
        )

    socketio.emit(
        "round_summary",
        {
            "room_id": room_id,
            "round": room["round_index"] + 1,
            "results": round_results,
            "scoreboard": room["scoreboard"],
        },
        room=room_id,
    )
    print(f"[DEBUG] socketio id in end_round({room_id}) = {id(socketio)}")

    room["round_index"] += 1
    room["status"] = "ready"