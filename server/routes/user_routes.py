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
    print("Spotify /me body:", resp.text)

    try:
        data = resp.json()
    except ValueError:
        data = {"raw": resp.text or "(empty response)"}

    if resp.status_code == 401:
        return jsonify({
            "error": "invalid_token",
            "details": data
        }), 401

    return jsonify(data), resp.status_code