# FE Build
FROM node:20-slim AS frontend
WORKDIR /frontend

COPY client/package*.json ./
RUN npm ci

# Copy source
COPY client/ ./

# Set the backend URL for production build
# Default target can be overwritten by build arg
ARG VITE_BACKEND_URL=https://guess-the-song.fly.dev
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV NODE_ENV=production

RUN npm run build



# BE Build
FROM python:3.11-slim AS backend
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir eventlet flask-socketio gunicorn

# Copy backend
COPY server/ ./

# Copy frontend bundle
COPY --from=frontend /frontend/dist ./static

ENV PORT=5000
ENV ENVIRONMENT=PROD
EXPOSE 5000


CMD ["python", "app.py"]