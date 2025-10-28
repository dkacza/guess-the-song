FROM node:20-slim AS frontend
WORKDIR /frontend
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build


FROM python:3.11-slim AS backend
WORKDIR /app
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir eventlet gunicorn
COPY server/ ./

COPY --from=frontend /frontend/dist ./static
EXPOSE 5000
ENV PORT=5000
CMD gunicorn app:app -k eventlet --certfile=cert.pem --keyfile=key.pem -b 0.0.0.0:5000