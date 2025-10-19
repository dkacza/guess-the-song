import string, random, uuid

def generate_random_string(length: int) -> str:
    possible = string.ascii_letters + string.digits
    return "".join(random.choice(possible) for _ in range(length))

def short_uuid(n=8):
    return str(uuid.uuid4())[:n]