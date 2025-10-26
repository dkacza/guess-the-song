def evaluate_title_points(guess, correct):
  return 70

def evaluate_artist_points(guess, correct):
  return 30

def evaluate_score(title_points, artist_points, time_factor, elapsed_time_ms, round_time_s):
  # Max points per round should be 100
  # The sum of the title and the artist guess is the baseline for the calculation
  score_from_guess = title_points + artist_points

  # We calculate the time penalty
  used_time_percentage = ((elapsed_time_ms / 1000) / round_time_s) * 100
  time_penalty = used_time_percentage * time_factor

  # The result is the combined guess score - penalty
  return score_from_guess - time_penalty



