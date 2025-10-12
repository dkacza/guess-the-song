from dotenv import load_dotenv
from flask import Flask, redirect, request, jsonify, make_response
from flask_cors import CORS


import string
import random
import os
import base64
import requests
import uuid


# Load environmental variables
load_dotenv()

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URL = os.getenv("SPOTIFY_REDIRECT_URL")
SERVER_PORT = os.getenv("SERVER_PORT")
FRONTEND_URL = os.getenv("FRONTEND_URL")

def generate_random_string(length: int):
    possible = string.ascii_letters + string.digits
    return "".join(random.choice(possible) for _ in range(length))

api_token_session_storage = {}
game_rooms = {}

def create_room(host_profile):
    room_id = str(uuid.uuid4())[:8]
    game_rooms[room_id] = {
        "room_id": room_id,
        "host": host_profile["id"],
        "playlist_id": None,
        "players": [host_profile],  # full profile dicts
        "status": "waiting",
    }
    return game_rooms[room_id]


app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    origins=[FRONTEND_URL],
)


# Spotify login request
# Server acts as a proxy between the client and the spotify authentication
# User is redirected to the login page
# After successfull auth flow the Spotify will send a request to callback enpoint
@app.route("/auth/login")
def auth_login():
    scope = "streaming user-read-email user-read-private"
    state = generate_random_string(16)

    auth_url = (
        "https://accounts.spotify.com/authorize?"
        f"response_type=code"
        f"&client_id={SPOTIFY_CLIENT_ID}"
        f"&scope={scope}"
        f"&redirect_uri={SPOTIFY_REDIRECT_URL}"
        f"&state={state}"
    )

    return redirect(auth_url)


# Spotify callback endpoint
# After successfull login spotify calls the application back with the the access code used to retrieve the API token.
@app.route("/auth/callback")
def auth_callback():
    access_code = request.args.get("code")
    if not access_code:
        return jsonify({"error": "Missing code parameter from Spotify callback"}), 400
    
    # After the access code is decoded, we make a request to /api/token to receive the API token.     
    SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

    auth_header = base64.b64encode(
        f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()
    ).decode("utf-8")

    api_token_response = requests.post(
        SPOTIFY_TOKEN_URL,
        data={
            "code": access_code,
            "redirect_uri": SPOTIFY_REDIRECT_URL,
            "grant_type": "authorization_code",
        },
        headers={
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    # The API token needs to be forwarded to the client.
    # We cannot set it in a cookie or, request body - therefore we store it in a simple session and pass it's ID as a query parameter.
    if api_token_response.status_code == 200:
        token_info = api_token_response.json()
        api_token = token_info.get("access_token")
        print("Token retrieved successfuly")
        session_id = str(uuid.uuid4())
        api_token_session_storage[session_id] = api_token
        return redirect(f"{FRONTEND_URL}?sid={session_id}")
    else:
        return jsonify({"error": "Failed to get Spotify API token", "details": api_token_response.json()}), 400
 

# Get the Spotify API token based on the temporary session
@app.post("/api/set-api-token")
def get_spotify_token():
    data = request.get_json()
    sid = data.get("session_id")
    print(sid)
    print(sid in api_token_session_storage)

    if not sid:
        return {"error": "invalid session"}, 400
    
    # Token is retrieved from the session storage and the entry is deleted afterwards
    spotify_api_token = api_token_session_storage.get(sid)
    api_token_session_storage.pop(sid, None)

    # The Spotift API token is sent as a cookie to the client.
    response = make_response({"status": "ok"})
    response.set_cookie(
        "spotify_api_token",
        spotify_api_token,
        httponly=True,
        secure=True,
        samesite="None",
    )
    return response


# Proxy endpoint for getting user data
@app.route("/api/me")
def me():
    spotify_api_token = request.cookies.get("spotify_api_token")

    if not spotify_api_token:
        return jsonify({"error": "unauthorized"}), 401

    r = requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {spotify_api_token}"},
    )
    return jsonify(r.json()), r.status_code


# Creation of game room
@app.post("/api/game/create")
def create_game():
    spotify_api_token = request.cookies.get("spotify_api_token")
    if not spotify_api_token:
        return jsonify({"error": "unauthorized"}), 401

    # Identify host via Spotify me endpoint
    me = requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {spotify_api_token}"},
    )
    if me.status_code != 200:
        return jsonify({"error": "cannot verify user"}), 401

    host_info = me.json()
    host_id = host_info.get("id")

    # Check if user has already opened the room
    existing_room = next(
        (r for r in game_rooms.values() if r["host"] == host_id),
        None,
    )
    if existing_room:
        print(f"User {host_id} already has game {existing_room['room_id']}")
        return jsonify(existing_room), 403

    host_profile = {
        "id": host_info.get("id"),
        "display_name": host_info.get("display_name"),
        "email": host_info.get("email"),
    }

    room = create_room(host_profile)
    print(f"Created game room {room['room_id']} by {host_id}")
    return jsonify(room), 201

@app.delete("/api/game/<room_id>")
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

    del game_rooms[room_id]
    print(f"Room {room_id} deleted by host {user_id}")

    return jsonify({"status": "deleted", "room_id": room_id}), 200

@app.get("/api/game/<room_id>")
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
        "playlist_id": room.get("playlist_id"),
        "status": room.get("status"),
        "players": room["players"],
    }

    return jsonify(room_info), 200

# Set playlist
@app.post("/api/game/set-playlist")
def set_playlist():
    data = request.get_json()
    room_id = data.get("room_id")
    playlist_id = data.get("playlist_id")

    if not room_id or room_id not in game_rooms:
        return jsonify({"error": "invalid room"}), 404

    room = game_rooms[room_id]
    room["playlist_id"] = playlist_id
    print(f"Room {room_id} playlist set to {playlist_id}")
    return jsonify(room)
    



if __name__ == "__main__":
    app.run(ssl_context=("cert.pem", "key.pem"), host="127.0.0.1", port=5000, debug=True)