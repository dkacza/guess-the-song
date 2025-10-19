from flask import Blueprint, jsonify, request
import requests

user_bp = Blueprint("users", __name__)

@user_bp.get("/api/me")
def me():
    token = request.cookies.get("spotify_api_token")
    if not token:
        return jsonify({"error": "unauthorized"}), 401
    resp = requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    return jsonify(resp.json()), resp.status_code