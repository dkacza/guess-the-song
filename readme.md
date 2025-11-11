# Guess-the-song

_A Spotify-based game to test your music knowledge._

The game follows a simple format, where the player must guess the title and the artist of the playing song. Users can create their own lobbies and compete together with their friends in real time.

The technical side of the application is based on the following technologies/services:

- Flask backend
- React frontend built with Vite
- SocketIO library
- Spotify Web Playback SDK
- Spotify Web API

## Local development setup

Prerequisites:

- Python 3
- Node.js
- Docker
- mkcert or equivalent tool for generating self-signed certificates

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

### Environment variables

```shell
cp config/local-be.env.template server/.env
cp config/local-fe.env.template client/.env
```

After copying make sure to fill the values for the following:
These can be retrieved from https://developer.spotify.com/dashboard

```.env
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

### Installing dependencies and running the application

**Redis**

```shell
docker run -d --name redis -p 6379:6379 redis:latest
```

**Back-end**

```shell
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Front-end**

```shell
cd client
npm install
npm run dev
```

The application will be available under: `https://localhost:5173`

### Fly IO deployment

The application is deployed to fly.io
It is available under https://guess-the-song.fly.dev/

#### Working with fly.io

**Provisioning environment**
In case the application is not created in the fly.io use the following command:

```shell
flyctl launch
```

Within the configurator make sure to request redis database.

**Scaling environment**
Due to the technical challenges regarding Socket.IO communication accross multiple application pods for now it needs to be scaled down only to single pod.

```shell
fly scale count 1
```

**Setting up the secrets**
Non-sensitive configuration is injected within the dockerfile during the application build. The secrets however need to be directly uploaded to fly.io.

```shell
cp config/prod.secrets.env.template config/prod.secrets.env
# Paste the secrets into newly created file
fly secrets import < config/prod.secrets.env
```

**Regular deployment**

```shell
fly deploy
```

### Notes:

- In order to access the application with your Spotify accont it needs to be added to the Spotify Applicaiton dashboard as it is not set to production. Contact repository owner for that purpose.
- At the current stage the application is in MVP phase, it might contain some bugs. In case of not being able to start the round - refresh the page and try again.
