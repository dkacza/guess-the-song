from utils.helpers import generate_random_string, short_uuid

game_rooms = {}

def create_room(host_profile):
    room_id = short_uuid()
    game_rooms[room_id] = {
        "room_id": room_id,
        "host": host_profile["id"],
        "playlist": None,
        "rules": None,
        "players": [host_profile],
        "status": "waiting",
        "access_code": generate_random_string(16)
    }
    return game_rooms[room_id]