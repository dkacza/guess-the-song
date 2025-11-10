import random
from utils.helpers import generate_random_string, short_uuid
from config import REDIS_URL, ROOM_TTL
from utils.logger import logger
import redis
import json


redis_instance = redis.Redis.from_url(REDIS_URL, decode_responses=True)


def create_room(host_profile):
    room_id = short_uuid()
    access_code = generate_random_string(16).join(''),
    new_room = {
        "room_id": room_id,
        "host": host_profile["id"],
        "playlist": None,
        "rules": None,
        "players": [host_profile],
        "access_code": access_code,
        "round": 0,
        "scoreboard": {},
        "subplaylist": [],
        "guesses": {},
        "status": "waiting",
        "ready_players": [],
        "previous_track": {},
        "round_results": {}
    }
    redis_instance.setex(f"game:{room_id}", ROOM_TTL, json.dumps(new_room))
    return new_room

def get_room(room_id):
    raw_room = redis_instance.get(f"game:{room_id}")
    return json.loads(raw_room)

def save_room(room):
    redis_instance.setex(f"game:{room['room_id']}", ROOM_TTL, json.dumps(room))

def delete_room(room_id):
    redis_instance.delete(f"game:{room_id}")

def all_rooms():
    keys = redis_instance.keys("game:*")
    result = []
    for key in keys:
        result.append(json.loads(redis_instance.get(key)))

    return result


def initialize_room(room_id):
    room = get_room(room_id);
    playlist = room.get("playlist")
    rules = room.get("rules", {})
    track_count = playlist.get("tracks_total", 10)
    rounds = min(rules.get("rounds", 10), track_count)

    all_tracks = room["playlist"]["tracks"]["items"]
    subplaylist = random.sample(all_tracks, rounds)

    # Initialize scoreboard
    scoreboard = {p["id"]: 0 for p in room["players"]}

    room.update({
        "subplaylist": subplaylist,
        "round": 0,
        "scoreboard": scoreboard,
        "status": "ready"
    })

    save_room(room)
    logger.info(f"[GAME] Game room {room_id} initialized")