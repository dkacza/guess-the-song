from flask import Blueprint, jsonify, request
import requests
from utils.logger import logger


user_bp = Blueprint("users", __name__)

@user_bp.get("/api/me")
def me():
    token = request.cookies.get("spotify_api_token")
    if not token:
        return jsonify({"error": "NO_TOKEN_PRESENT"}), 401

    resp = requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    logger.info(f"[AUTH] Spotify /me response", extra={"data": resp.json()})


    try:
        data = resp.json()
    except ValueError:
        data = {"raw": resp.json() or "(empty response)"}

    if resp.status_code == 401:
        return jsonify({
            "error": "invalid_token",
            "details": data
        }), 401

    return jsonify(data), resp.status_code