import os

# List of environment variable names (same as in OS)
env_keys = [
    "SPOTIFY_CLIENT_ID",
    "SPOTIFY_CLIENT_SECRET",
    "SPOTIFY_REDIRECT_URL",
    "FRONTEND_URL",
    "SERVER_PORT",
    "CERT_PATH",
    "KEY_PATH",
    "ENVIRONMENT",
    "REDIS_URL",
    "ROOM_TTL",
]

# Create env_list dynamically
env_list = [f"{key}={os.getenv(key)}" for key in env_keys]

print(env_list)