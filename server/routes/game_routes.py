from flask import Blueprint, jsonify, request
from config import FRONTEND_URL
from spotify import get_user_from_token
from models.game_store import game_rooms, create_room
from sockets.socket import socketio

import requests

game_bp = Blueprint("games", __name__)

@game_bp.post("/api/game/create")
def create_game():
    token = request.cookies.get("spotify_api_token")
    if not token:
        return jsonify({"error": "unauthorized"}), 401
    me_resp = get_user_from_token(token)
    if me_resp.status_code != 200:
        return jsonify({"error": "cannot verify user"}), 401
    host_info = me_resp.json()
    host_profile = {
        "id": host_info["id"],
        "display_name": host_info.get("display_name"),
        "email": host_info.get("email"),
    }
    room = create_room(host_profile)
    print(f"[API] Room {room['room_id']} created by {host_profile['id']}")
    return jsonify(room), 201


@game_bp.delete("/api/game/<room_id>")
def delete_game(room_id):
    # Verify request auth
    spotify_api_token = request.cookies.get("spotify_api_token")
    if not spotify_api_token:
        return jsonify({"error": "unauthorized"}), 401

    r = requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {spotify_api_token}"},
    )
    if r.status_code != 200:
        return jsonify({"error": "cannot verify user"}), 401

    user_id = r.json().get("id")

    # Validate room existence
    room = game_rooms.get(room_id)
    if not room:
        return jsonify({"error": "room not found"}), 404

    # Verify ownership
    if room["host"] != user_id:
        return jsonify({"error": "forbidden – only host may delete room"}), 403
    
    socketio.emit(
        "game_deleted",
        {
            "user_id": user_id,
            "room_id": room_id,
        },
            room=room_id,
    )

    del game_rooms[room_id]
    print(f"Room {room_id} deleted by host {user_id}")

    return jsonify({"status": "deleted", "room_id": room_id}), 200


@game_bp.get("/api/game/<room_id>")
def get_game(room_id):
    spotify_api_token = request.cookies.get("spotify_api_token")
    if not spotify_api_token:
        return jsonify({"error": "unauthorized"}), 401

    # Validate Spotify token to be sure cookie isn't stale
    me_resp = requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {spotify_api_token}"},
    )
    if me_resp.status_code != 200:
        return jsonify({"error": "cannot verify user"}), 401

    user = me_resp.json()
    user_id = user.get("id")

    # --- Lookup room ---
    room = game_rooms.get(room_id)
    if not room:
        return jsonify({"error": "room not found"}), 404

    # --- Verify that user is either host or participant ---
    is_member = any(p["id"] == user_id for p in room["players"])
    if not is_member and user_id != room["host"]:
        return jsonify({"error": "forbidden: not part of this room"}), 403

    # Return a direct copy (do not mutate global store from jsonify)
    room_info = {
        "room_id": room["room_id"],
        "host": room["host"],
        "playlist": room.get("playlist"),
        "rules": room.get("rules"),
        "status": room.get("status"),
        "players": room["players"],
        "access_code": room["access_code"]
    }

    return jsonify(room_info), 200


@game_bp.post("/api/game/join")
def join_game():
    data = request.get_json()
    access_code = data.get("access_code")

    spotify_api_token = request.cookies.get("spotify_api_token")
    if not spotify_api_token:
        return jsonify({"error": "unauthorized"}), 401

    # Identify user
    me_resp = requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {spotify_api_token}"},
    )
    if me_resp.status_code != 200:
        return jsonify({"error": "cannot verify user"}), 401

    player_info = me_resp.json()
    player_id = player_info.get("id")

    # Find room by access code
    target_room = next(
        (room for room in game_rooms.values() if room["access_code"] == access_code),
        None,
    )

    if not target_room:
        return jsonify({"error": "room not found"}), 404

    # Check if already in the room
    already_exists = any(p["id"] == player_id for p in target_room["players"])
    if not already_exists:
        target_room["players"].append(
            {
                "id": player_info.get("id"),
                "display_name": player_info.get("display_name"),
                "email": player_info.get("email"),
            }
        )
        print(f"[API] Player {player_id} joined room {target_room['room_id']}")
        # You can emit an event here if you want live updates:
        socketio.emit(
            "user_joined",
            {
                "user_name": player_info.get("display_name"),
                "room_id": target_room["room_id"],
            },
            room=target_room["room_id"],
        )

    return jsonify(target_room), 200


# Set playlist
@game_bp.post("/api/game/set-playlist")
def set_playlist():
    data = request.get_json()
    room_id = data.get("room_id")
    playlist_id = data.get("playlist_id")

    if not room_id or room_id not in game_rooms:
        return jsonify({"error": "invalid room"}), 404
    
    spotify_api_token = request.cookies.get("spotify_api_token")
    if not spotify_api_token:
        return jsonify({"error": "unauthorized"}), 401
    
    playlist_response = requests.get(
        f"https://api.spotify.com/v1/playlists/{playlist_id}",
        headers={"Authorization": f"Bearer {spotify_api_token}"},
    )

    if playlist_response.status_code != 200:
        return jsonify({"error": "failed to fetch playlist"}), 400

    playlist_data = playlist_response.json()

    playlist_info = {
        "id": playlist_data.get("id"),
        "name": playlist_data.get("name"),
        "owner": playlist_data.get("owner", {}).get("display_name"),
        "tracks_total": playlist_data.get("tracks", {}).get("total"),
        "image_url": (
            playlist_data.get("images")[0]["url"]
            if playlist_data.get("images")
            else None
        ),
        "external_url": playlist_data.get("external_urls", {}).get("spotify"),
        "description": playlist_data.get("description"),
    }

    rules = {
        "rounds": int(playlist_info["tracks_total"] / 2),
        "time_per_round": 30,
        "speed_factor": 0.5
    }

    room = game_rooms[room_id]
    room["playlist"] = playlist_info
    room["rules"] = rules

    print(f"Room {room_id} playlist set to {playlist_id}. Playlist details fetched from spotify")

    socketio.emit("playlist_set", {"user_name": "PLACEHOLDER", "room_id": room_id}, room=room_id)

    return jsonify(room)


@game_bp.post("/api/game/set-rules")
def set_rules():
    data = request.get_json()
    room_id = data.get("room_id")
    rules = data.get("rules")

    if not room_id or room_id not in game_rooms:
        return jsonify({"error": "invalid room"}), 404

    room = game_rooms[room_id]
    room["rules"] = rules

    print(f"[API] Rules updated for room {room_id}: {rules}")

    # Notify connected clients to sync
    socketio.emit("rules_updated", {"room_id": room_id, "rules": rules}, room=room_id)

    return jsonify(room)

