import base64, requests
from config import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URL

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

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

def get_user_from_token(token):
    return requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {token}"},
    )