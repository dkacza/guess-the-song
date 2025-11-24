# server/config.py
import os
from dotenv import load_dotenv

load_dotenv()

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URL = os.getenv("SPOTIFY_REDIRECT_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL")
SERVER_PORT = int(os.getenv("SERVER_PORT", 5000))
CERT_PATH = os.getenv("CERT_PATH")
KEY_PATH = os.getenv("KEY_PATH")
ENVIRONMENT = os.getenv("ENVIRONMENT")
REDIS_URL = os.getenv("REDIS_URL")
ROOM_TTL = os.getenv("ROOM_TTL")

_admin_ids_str = os.getenv("ADMIN_IDS")
ADMIN_IDS = [str(x) for x in _admin_ids_str.split(",") if x]