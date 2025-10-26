from flask_socketio import emit, join_room, leave_room
from models.game_store import game_rooms, initialize_game
from threading import Timer
from flask import request, jsonify
from sockets.socket import socketio
from spotify import add_track_to_queue


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


    @socketio.on("prepare_for_next_round")
    def prepare_for_next_round(data):
        # 1. Grab the spotify api token
        spotify_token = request.cookies.get("spotify_api_token")
        print("Cookies:", request.cookies)
        if not spotify_token:
            emit("error", {"error": "unauthorized"})
            return
        
        # 2. Determine the next song
        room_id = data.get("room_id")
        room = game_rooms.get(room_id)
        if not room:
            return
        
        current_round = room["round"]        
        current_track = room["subplaylist"][current_round]
        track_uri = current_track.get("track").get("uri")
        device_id = data.get("device_id")

        # 2. Call the queue endpoint of the API
        add_track_to_queue(spotify_token, track_uri, device_id)

        
        # 3. Mark the user as ready
        user_id = data.get("user_id")
        room.get("ready_players").append(user_id)

        socketio.emit(
            "user_ready",
            {"room_id": room_id, "user_id": user_id},
            room=room_id,
        )
        print(f"[ROUND] Player {user_id} ready for the next round. Song added to the queue")

        # 4. Validate if all users are ready, if so trigger the commence round event
        all_player_ids = {p["id"] for p in room["players"]}
        if set(room.get("ready_players")) >= all_player_ids:
            print(f"[ROUND] All {len(all_player_ids)} players ready. Commencing round")
            room["ready_players"].clear()
            commence_round(data)



    def commence_round(data):
        room_id = data.get("room_id")
        room = game_rooms.get(room_id)
        if not room:
            return

        round = room["round"]
        if round >= len(room["subplaylist"]):
            socketio.emit("game_finished", {"scoreboard": room["scoreboard"]}, room=room_id)
            room["status"] = "finished"
            return

        current_track = room["subplaylist"][round]
        room["current_track"] = current_track
        room["guesses"] = {}
        room["status"] = "round_active"

        print(f"[ROUND] Starting round {round + 1}/{len(room['subplaylist'])}")
        socketio.emit(
            "round_started",
            {"room_id": room_id, "round": round + 1, "track": current_track},
            room=room_id,
        )

        # Start timeout
        duration = room["rules"]["time_per_round"]
        socketio.start_background_task(delayed_end_round, room_id, duration)

    @socketio.on("user_guess")
    def user_guess(data):
        print('[ROUND] User guess registered')
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
            room["invalidated_timeout"] = True
            end_round(room_id)

def delayed_end_round(room_id, delay):
    socketio.sleep(delay)
    room = game_rooms.get(room_id)
    if room.get("invalidated_timeout") == True:
        return
    end_round(room_id)


def end_round(room_id):
    room = game_rooms.get(room_id)
    if not room or room.get("status") != "round_active":
        return

    print(f"[ROUND] Ending round for {room_id}")
    room["status"] = "round_summary"
    room["ready_players"] = []

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

    room["round"]

    socketio.emit(
        "round_summary",
        {
            "room_id": room_id,
            "round": room["round"] + 1,
            "results": round_results,
            "scoreboard": room["scoreboard"],
        },
        room=room_id,
    )

    room["round"] += 1
    room["status"] = "ready"