import random
from utils.helpers import generate_random_string, short_uuid
from config import REDIS_URL, ROOM_TTL, ADMIN_IDS
from utils.logger import logger
from spotify import get_user_from_token
import redis
import json


redis_instance = redis.Redis.from_url(REDIS_URL, decode_responses=True)


def create_user(user_info):
    is_admin = user_info["id"] in ADMIN_IDS

    user_profile = {
        "id": user_info["id"],
        "display_name": user_info.get("display_name", ""),
        "email": user_info.get("email", ""),
        "admin": str(is_admin),  # convert boolean to string
    }

    redis_key = f"user:{user_info['id']}"  # prefix to avoid collisions
    redis_instance.hset(redis_key, mapping=user_profile)

    return user_profile


def find_user_by_id(user_id):
    redis_key = f"user:{user_id}"
    if not redis_instance.exists(redis_key):
        return None

    data = redis_instance.hgetall(redis_key)

    # Only decode if the data is bytes
    decoded = {k.decode() if isinstance(k, bytes) else k:
               v.decode() if isinstance(v, bytes) else v
               for k, v in data.items()}
    return decoded

def check_if_user_is_admin(user_id):
    if user_id in ADMIN_IDS:
        return True
    return False

