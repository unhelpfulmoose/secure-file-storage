# Secure File Storage & Delivery System
Examensarbete Java24 — A full-stack application for securely uploading, storing, and downloading files with AES-256 encryption at rest.


## Features

- **Multi-file upload** — select or drag-and-drop multiple files at once; uploads submit automatically when files are dropped
- **Gallery view** — regular users see files in a visual gallery with inline preview and download
- **Uploader tracking** — admins can see which user uploaded each file
- **Persistent storage** — PostgreSQL and MinIO data is stored in named Docker volumes and survives container restarts

---

## Getting started

```bash
git clone https://github.com/your-username/secure-file-storage.git
cd secure-file-storage
```

Then follow the steps below to start all required services and run the app.

---

## Quick start with Docker Compose

The easiest way to run the project. Everything starts with one command.

1. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

2. Start everything:
```bash
docker compose up --build
```

The first run takes a few minutes to build the images. Once ready:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- MinIO console: `http://localhost:9001`

To stop:
```bash
docker compose down
```

---

## What a successful startup looks like

- PostgreSQL, MinIO, and Redis are running (Docker containers show as `Up`)
- The backend starts without errors and prints something like `Started SecurefilesApplication`
- The frontend opens at `http://localhost:5173` and shows a login form

If the backend fails to start, check that all environment variables are set and that all three services are running before the backend.

---

## Tech stack

- **Backend**: Java 21, Spring Boot 3.4.3, Spring Security (JWT), Spring Data JPA, Flyway
- **Database**: PostgreSQL
- **Storage**: MinIO (S3-compatible object store)
- **Cache / token denylist**: Redis 7
- **Frontend**: React 19 + TypeScript, Vite, Axios

---

## Prerequisites

- Java 21
- Node.js 20+
- Docker (for running PostgreSQL, MinIO, and Redis)
- Maven

---

## Environment variables

The application requires the following environment variables to be set before startup. **Never hardcode these values in any file.**

| Variable | Description |
|----------|-------------|
| `DB_PASSWORD` | PostgreSQL password for the `postgres` user |
| `DB_HOST` | PostgreSQL hostname (default: `localhost`) |
| `DB_PORT` | PostgreSQL port (default: `5434`) |
| `ADMIN_PASSWORD` | Password for the default `admin` account created on first startup |
| `JWT_SECRET` | Secret key used to sign JWT tokens — must be at least 32 characters |
| `MASTER_ENCRYPTION_KEY` | A secret key used to protect the encryption keys for each file — treat it like a strong password, min 32 characters |
| `MINIO_ENDPOINT` | MinIO server URL, e.g. `http://localhost:9000` |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET` | MinIO bucket name, e.g. `securefiles` |
| `CORS_ORIGIN` | Allowed frontend origin, e.g. `http://localhost:5173` |
| `REDIS_HOST` | Redis server hostname, e.g. `localhost` |
| `REDIS_PORT` | Redis server port, e.g. `6379` |
| `SERVER_PORT` | Port the backend listens on (default: `8080`) |

A template with all variables is provided in `.env.example`. Copy it and fill in your values:

```bash
cp .env.example .env
```

## Startup order

Start services in this order — the backend will fail to start if PostgreSQL, MinIO, or Redis is not running:

1. PostgreSQL
2. MinIO
3. Redis
4. Backend — press the green play button in IntelliJ, or run `./mvnw spring-boot:run` in the terminal from the `securefiles/` folder
5. Frontend — run `npm run dev` in a terminal (VS Code's built-in terminal works well) from the `frontend/` folder

---

## User roles

| Role | Upload | List / Preview / Download | Delete | Manage users | Audit log |
|------|--------|--------------------------|--------|--------------|-----------|
| `admin` | yes | yes | yes | yes | yes |
| `user` | no | yes | no | no | no |

Users are created and managed from the admin dashboard. Admins can also see which user uploaded each file.

---

## Logging in

Once everything is running, open `http://localhost:5173` in your browser. Use these credentials:

| Username | Password | Role |
|----------|----------|------|
| `admin` | value of `ADMIN_PASSWORD` | Can upload, preview, download, delete files, and manage users |

The admin account is created automatically on first startup. Additional users can be created from the admin dashboard.

---

## File upload limits

- Max file size: **10MB**
- Allowed types: images, audio, video, PDF, plain text

---

## Dependency notes

> **FYI — axios version pin:** axios is locked to `1.13.6` (no `^` prefix in `package.json`). Versions `1.14.1` and `0.30.4` were found to be compromised — they shipped a malicious dependency that acted as a Remote Access Trojan dropper. See [StepSecurity disclosure](https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan) for details. Don't upgrade axios without checking the version is safe first.
