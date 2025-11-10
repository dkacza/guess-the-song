import base64, requests
from config import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URL
from utils.logger import logger


SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_BASE_URL = "https://api.spotify.com/v1"

def exchange_code_for_token(code):
    auth_header = base64.b64encode(
        f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()
    ).decode("utf-8")

    resp = requests.post(
        SPOTIFY_TOKEN_URL,
        data={
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URL,
            "grant_type": "authorization_code",
        },
        headers={
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    return resp

def add_track_to_queue(token: str, track_uri: str, device_id: str | None = None):
    try:
        url = f"{SPOTIFY_BASE_URL}/me/player/queue"
        params = {"uri": track_uri}
        if device_id:
            params["device_id"] = device_id

        res = requests.post(url, headers={
            "Authorization": f"Bearer {token}"
        }, params=params)

        if res.status_code == 204 or res.status_code == 200:
            logger.info("[SPOTIFY] Track added to queue")
            return True
        else:
            logger.error("[SPOTIFY] Unable to add track to the queue", extra={"data": res.json()})
            return False
    except Exception as e:
        logger.error("[SPOTIFY] Exception occured when adding track to queue", extra={"data": e})
        return False


def get_user_from_token(token):
    return requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {token}"},
    )