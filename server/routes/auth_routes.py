# server/routes/auth_routes.py
from flask import Blueprint, redirect, request, jsonify, make_response
import uuid
from spotify import exchange_code_for_token
from utils.helpers import generate_random_string
from config import SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URL, FRONTEND_URL
from utils.logger import logger


auth_bp = Blueprint("auth", __name__)
api_token_session_storage = {}

# Spotify login request
# Server acts as a proxy between the client and the spotify authentication
# User is redirected to the login page
# After successfull auth flow the Spotify will send a request to callback enpoint
@auth_bp.route("/auth/login")
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
    logger.info(f"[AUTH] Incoming Spotify login request", extra={"data": request})

    return redirect(auth_url)

# Spotify callback endpoint
# After successfull login spotify calls the application back with the the access code used to retrieve the API token.
@auth_bp.route("/auth/callback")
def auth_callback():
    code = request.args.get("code")
    if not code:
        logger.error(f"[AUTH] Missing code parameter from Spotify callback", extra={"data": request})
        return jsonify({"error": "Missing code parameter"}), 400

    resp = exchange_code_for_token(code)

    # The API token needs to be forwarded to the client.
    # We cannot set it in a cookie or, request body - therefore we store it in a simple session and pass it's ID as a query parameter.
    if resp.status_code == 200:
        token_info = resp.json()
        api_token = token_info.get("access_token")
        session_id = str(uuid.uuid4())
        api_token_session_storage[session_id] = api_token
        return redirect(f"{FRONTEND_URL}/?sid={session_id}")
    else:
        logger.error(f"[AUTH] Failed to get Spotify token", extra={"data": resp.json()})
        return jsonify({"error": "Failed to get Spotify token", "details": resp.json()}), 400

# Get the Spotify API token based on the temporary session
@auth_bp.post("/api/set-api-token")
def set_spotify_token():
    from flask import request
    data = request.get_json()
    sid = data.get("session_id")
    token = api_token_session_storage.pop(sid, None)
    if not token:
        logger.error(f"[AUTH] Invalid session id.", extra={"data": request})
        return {"error": "invalid session"}, 400

    response = make_response({"status": "ok"})
    response.set_cookie(
        "spotify_api_token",
        token,
        httponly=True,
        secure=True,
        samesite="None",
    )
    return response

# Get the Spotify API token in the response body to use it directly in the JS code
@auth_bp.get("/api/spotify-token")
def get_spotify_token():
    token = request.cookies.get("spotify_api_token")
    if not token:
        logger.error(f"[AUTH] Spotify API token not found", extra={"data": request})
        return jsonify({"error": "unauthorized"}), 401
    return jsonify({"token": token})