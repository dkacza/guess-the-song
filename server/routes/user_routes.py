from flask import Blueprint, jsonify, request
import requests

from spotify import get_user_from_token
from utils.logger import logger
from models.user_store import create_user, find_user_by_id, check_if_user_is_admin

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
    logger.info(f"[AUTH] Spotify /me response", extra={"data": resp.json()})


    try:
        data = resp.json()
        if check_if_user_is_admin(data["id"]):
            data["is_admin"] = "True"
        else:
            data["is_admin"] = "False"
    except ValueError:
        data = {"raw": resp.json() or "(empty response)"}

    if resp.status_code == 401:
        return jsonify({
            "error": "invalid_token",
            "details": data
        }), 401

    return jsonify(data), resp.status_code

@user_bp.post("/api/user/create")
def create_user_endpoint():

    token = request.cookies.get("spotify_api_token")

    if not token:
        logger.error(f"[AUTH] No spotify token on game-creation request", extra={"data": request})
        return jsonify({"error": "unauthorized"}), 401
    
    me_resp = get_user_from_token(token)

    if me_resp.status_code != 200:
        logger.error(f"[AUTH] User cannot be verified", extra={"data": me_resp.text})
        return jsonify({"error": "cannot verify user"}), 401
    
    user_info = me_resp.json()
    
    existing_user = find_user_by_id(user_info['id'])

    if existing_user is None:
        user = create_user(user_info)
        return jsonify(user), 201
    
    return jsonify(existing_user), 200