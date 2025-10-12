from dotenv import load_dotenv
from flask import Flask, redirect, request, jsonify, make_response

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
SPOTIFY_REDIRECT_URL = os.getenv("SPOTIFY_REDIRECT_URI")
SERVER_PORT = os.getenv("SERVER_PORT")
FRONTEND_URL = os.getenv("FRONTEND_URL")

def generate_random_string(length: int):
    possible = string.ascii_letters + string.digits
    return "".join(random.choice(possible) for _ in range(length))

api_token_session_storage = {}


app = Flask(__name__)


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
@app.get("/api/get-spotify-token")
def get_spotify_token():
    data = request.get_json()
    sid = data.get("session_id")

    if not sid or sid not in api_token_session_storage:
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

if __name__ == "__main__":
    app.run(ssl_context=("cert.pem", "key.pem"), host="127.0.0.1", port=5000, debug=True)