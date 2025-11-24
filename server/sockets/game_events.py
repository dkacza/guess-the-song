from flask_socketio import emit, join_room, leave_room
from threading import Timer
from flask import request, jsonify
from sockets.socket import socketio
from spotify import add_track_to_queue
from utils.answer_evaluators import evaluate_artist_points, evaluate_title_points, evaluate_score
from utils.logger import logger
from models.game_store import create_room, all_rooms, get_room, delete_room, save_room, initialize_room


import math


def register_socket_events(socketio):
    @socketio.on("connect")
    def on_connect():
        logger.info("[SocketIO] Player joined room")

    @socketio.on("join_room")
    def on_join(data):
        logger.info("[SocketIO] registered event join_room", extra={"data": data})
        room_id = data.get("room_id")
        user_name = data.get("user_name")
        if not room_id:
            logger.error("[GAME] Missing room_id parameter", extra={"data": data})
            emit("error", {"message": "Missing room_id"})
            return
        join_room(room_id)
        logger.info("[GAME] User joined the game. Emitting user_joined event.", extra={"data": data})
        emit("user_joined", {"user_name": user_name, "room_id": room_id}, room=room_id)

    @socketio.on("leave_room")
    def on_leave(data):
        logger.info("[SocketIO] registered event leave_room", extra={"data": data})
        room_id = data.get("room_id")
        user_name = data.get("user_name")
        leave_room(room_id)
        logger.info(f"[GAME] {user_name} left {room_id}. Emitting user_left event.")
        room = get_room(room_id)
        if room:
            room["players"] = [p for p in room["players"] if p["email"] != user_name]
            if not room["players"]:
                delete_room[room_id]
        emit("user_left", {"user_name": user_name, "room_id": room_id}, room=room_id)


    @socketio.on("start_game")
    def start_game(data):
        logger.info("[SocketIO] registered event leave_room", extra={"data": data})
        room_id = data.get("room_id")
        user_id = data.get("user_id")

        room = get_room(room_id)
        if not room or room["host"] != user_id:
            logger.error(f"[GAME] Only host can start the game")
            emit("error", {"msg": "Only host can start the game"})
            return

        initialize_room(room_id)
        emit("game_ready", {"room_id": room_id, "room": room["rules"]}, room=room_id)
        logger.info(f"[GAME] Emitting game_ready event")


    @socketio.on("prepare_for_next_round")
    def prepare_for_next_round(data):
        logger.info("[SocketIO] registered event prepare_for_next_round", extra={"data": data})
        # 1. Grab the spotify api token
        spotify_token = request.cookies.get("spotify_api_token")
        if not spotify_token:
            logger.error(f"[AUTH] Spotify token not present in the prepare_for_next_round event")
            emit("error", {"error": "unauthorized"})
            return
        
        # 2. Determine the next song
        room_id = data.get("room_id")
        room = get_room(room_id)
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
        save_room(room)

        socketio.emit(
            "user_ready",
            {"room_id": room_id, "user_id": user_id},
            room=room_id,
        )
        logger.info(f"[GAME] Player {user_id} ready for the next round. Song ${track_uri} added to the queue")

        # 4. Validate if all users are ready, if so trigger the commence round event
        all_player_ids = {p["id"] for p in room["players"]}
        if set(room.get("ready_players")) >= all_player_ids:
            logger.info(f"[GAME] All {len(all_player_ids)} players ready. Commencing round")
            room["ready_players"].clear()
            save_room(room)
            commence_round(data)



    def commence_round(data):
        room_id = data.get("room_id")
        room = get_room(room_id)
        if not room:
            return

        round = room["round"]
        if round >= len(room["subplaylist"]):
            logger.info(f"[GAME] Game Finnished. Emmitting game_finished event.")
            socketio.emit("game_finished", {"scoreboard": room["scoreboard"]}, room=room_id)
            room["status"] = "finished"
            return

        current_track = room["subplaylist"][round]
        room["current_track"] = current_track
        room["guesses"] = {}
        room["status"] = "round_active"
        
        save_room(room)
        logger.info(f"[GAME] Starting round {round + 1}/{len(room['subplaylist'])}")

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
        logger.info("[SocketIO] registered event user_guess", extra={"data": data})
        room_id = data.get("room_id")
        user_id = data.get("user_id")
        guess = data.get("guess")
        elapsed = data.get("elapsed_time", 0)

        room = get_room(room_id)
        if not room or room["status"] != "round_active":
            return

        room["guesses"][user_id] = {"guess": guess, "elapsed": elapsed}
        save_room(room)

        # Check if all have guessed
        if len(room["guesses"]) == len(room["players"]):
            room["invalidated_timeout"] = True
            save_room(room)
            end_round(room_id)

def delayed_end_round(room_id, delay):
    socketio.sleep(delay)
    room = get_room(room_id)
    if room.get("invalidated_timeout") == True:
        return
    logger.info("[GAME] Round ended with timeout")
    end_round(room_id)


def end_round(room_id):
    room = get_room(room_id)
    if not room or room.get("status") != "round_active":
        return

    logger.info(f"[GAME] Ending round for {room_id}")
    room["status"] = "round_summary"
    room["ready_players"] = []
    room["previous_track"] = room.get("current_track")

    correct_track = room["current_track"]
    round_results = {}

    for player in room["players"]:
        pid = player["id"]

        users_guess = {"title": "", "artist": ""}
        if room["guesses"].get(pid):
            users_guess = room["guesses"].get(pid)['guess']
            
        guessed_title = users_guess["title"]
        guessed_artist = users_guess["artist"]
        time_per_round = room["rules"].get("time_per_round")
        elapsed_time = room.get("guesses", {}).get(pid, {}).get("elapsed", time_per_round)
        time_factor = room["rules"].get("speed_factor")

        title_points = evaluate_title_points(guessed_title, correct_track["track"]["name"])
        artist_points = evaluate_artist_points(guessed_artist, correct_track["track"]["artists"])

        round_points = math.floor(evaluate_score(title_points, artist_points, time_factor, elapsed_time, time_per_round))

        round_results[pid] = {
            "player": pid,
              "round_points": round_points, 
              "guess_time": elapsed_time, 
              "title_guess": guessed_title, 
              "title_points": title_points,
              "artist_guess": guessed_artist,
              "artist_points": artist_points,
              "total_points": room["scoreboard"][pid] + round_points
        }
        
        room["scoreboard"][pid] += round_points

    room["round_results"] = round_results
    room["round"] += 1
    room["status"] = "ready"

    save_room(room)


    socketio.emit(
        "round_summary",
        {
            "room_id": room_id,
            "round": room["round"],
            "results": round_results,
            "scoreboard": room["scoreboard"],
        },
        room=room_id,
    )

