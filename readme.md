## Local development setup

### SSL Certificates

Generate the SSL certificates and paste them into the `server` and `client` directories using the following script.

```shell
mkcert -install
mkcert localhost 127.0.0.1 ::1
mv ./localhost+2.pem ./server/localhost+2.pem
mv ./localhost+2-key.pem ./server/localhost+2-key.pem
cp ./server/localhost+2.pem ./client/localhost+2.pem
cp ./server/localhost+2-key.pem ./client/localhost+2-key.pem
```

Create the `.env` file in `server/` directory. Paste in the contents of the template below.

```.env
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SERVER_PORT=5000
SPOTIFY_REDIRECT_URL=https://127.0.0.1:5000/auth/callback
FRONTEND_URL=https://localhost:5137
CERT_PATH=./localhost+2.pem
KEY_PATH=./localhost+2-key.pem
```

Install dependencies and run the application

```shell
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
