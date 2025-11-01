import logging
import json
import sys
from datetime import datetime


class JsonFormatter(logging.Formatter):
    def format(self, record):
        base = {
            "time": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }

        # Merge any extras (everything in record.__dict__)
        for key, value in record.__dict__.items():
            # skip internal logging attributes
            if key in ("msg", "args", "levelname", "levelno", "pathname",
                       "filename", "module", "exc_info", "exc_text",
                       "stack_info", "lineno", "funcName", "created",
                       "msecs", "relativeCreated", "thread", "threadName",
                       "processName", "process"):
                continue
            # Safely JSON‑encode any non‑serializable objects
            try:
                json.dumps(value)
                base[key] = value
            except Exception:
                base[key] = str(value)

        return json.dumps(base, ensure_ascii=False)


# ---------- create global logger ----------
logger = logging.getLogger("guess_the_song")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)