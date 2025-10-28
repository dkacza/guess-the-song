# server/app.py
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.game_routes import game_bp
from sockets.game_events import register_socket_events
from config import FRONTEND_URL, SERVER_PORT, CERT_PATH, KEY_PATH
from sockets.socket import socketio
import eventlet
import os

app = Flask(__name__)

socketio.init_app(app, cors_allowed_origins=FRONTEND_URL, async_mode="eventlet")

# Routes
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(game_bp)

# Socket events
register_socket_events(socketio)

CORS(
    app,
    supports_credentials=True,
    origins=[FRONTEND_URL],
)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    static_dir = os.path.join(app.root_path, "static")
    file_path = os.path.join(static_dir, path)
    if path and os.path.exists(file_path):
        return send_from_directory(static_dir, path)
    return send_from_directory(static_dir, "index.html")

if __name__ == "__main__":
    listener = eventlet.listen(("127.0.0.1", SERVER_PORT))
    ssl_listener = eventlet.wrap_ssl(
        listener,
        server_side=True,
        certfile=CERT_PATH,
        keyfile=KEY_PATH,
    )
    print(f"Server running on port {SERVER_PORT}")
    eventlet.wsgi.server(ssl_listener, app)