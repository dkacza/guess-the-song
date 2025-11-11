import re
from difflib import SequenceMatcher
import math

TITLE_PERCENTAGE = 70
ARTIST_PERCENTAGE = 30

def clean_title(title: str) -> str:
    title = title.lower().strip()

    title = re.sub(r"\(.*?\)", "", title)

    title = re.split(r"[-|–—]", title)[0]

    noise_patterns = [
        r"\bfeat\b.*",
        r"\bft\b.*",
        r"\bremaster(ed)?\b.*",
        r"\blive\b.*",
        r"\bversion\b.*",
        r"\bedit\b.*",
    ]
    for pattern in noise_patterns:
        title = re.sub(pattern, "", title)

    title = re.sub(r"\s+", " ", title).strip()

    return title

def clean_artist(artist: str) -> str:
    artist = artist.lower().strip()

    # Remove text in parentheses or brackets, e.g. "(DJ Set)"
    artist = re.sub(r"[()\[\]]", "", artist)

    # Remove "feat.", "ft.", "featuring", "with", etc.
    noise_patterns = [
        r"\bfeat\.?\b.*",
        r"\bft\.?\b.*",
        r"\bfeaturing\b.*",
        r"\bwith\b.*",
        r"\band\b.*",
        r"&.*",  # sometimes multiple collaborators separated by "&"
    ]
    for pattern in noise_patterns:
        artist = re.sub(pattern, "", artist)

    # Remove extra spaces
    artist = re.sub(r"\s+", " ", artist).strip()

    return artist

def evaluate_title_points(guess, correct):
  similarity = SequenceMatcher(None, clean_title(guess), clean_title(correct)).ratio()
  return math.floor(similarity * TITLE_PERCENTAGE)

def evaluate_artist_points(guess, correct):
  artists_clean = clean_artist(", ".join(a["name"] for a in correct))
  guess_clean = clean_artist(guess)

  similarity = SequenceMatcher(None, artists_clean, guess_clean).ratio()
  return math.floor(similarity * ARTIST_PERCENTAGE)

def evaluate_score(title_points, artist_points, time_factor, elapsed_time_ms, round_time_s):
  # Max points per round should be 100
  # The sum of the title and the artist guess is the baseline for the calculation
  score_from_guess = title_points + artist_points

  # We calculate the time penalty
  used_time_percentage = ((elapsed_time_ms / 1000) / round_time_s) * 100
  time_penalty = used_time_percentage * time_factor

  # The result is the combined guess score - penalty
  return max(score_from_guess - time_penalty, 0)



