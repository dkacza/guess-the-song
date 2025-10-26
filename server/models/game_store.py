import random
from utils.helpers import generate_random_string, short_uuid

game_rooms = {}

def initialize_game(room_id):
    room = game_rooms[room_id]
    playlist = room.get("playlist")
    rules = room.get("rules", {})
    track_count = playlist.get("tracks_total", 20)
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
    print(f'[MODEL] Game {room_id} initialized')
    return room

def create_room(host_profile):
    room_id = short_uuid()
    game_rooms[room_id] = {
        "room_id": room_id,
        "host": host_profile["id"],
        "playlist": None,
        "rules": None,
        "players": [host_profile],
        "access_code": generate_random_string(16),
        "round": 0,
        "scoreboard": {},
        "subplaylist": [],
        "guesses": {},
        "status": "waiting",
        "ready_players": []
    }
    return game_rooms[room_id]