# Secure File Storage & Delivery System
Examensarbete Java24 — A full-stack application for securely uploading, storing, and downloading files with AES-256 encryption at rest.

## Tech stack

- **Backend**: Java 21, Spring Boot 3.4.3, Spring Security (JWT), Spring Data JPA, Flyway
- **Database**: PostgreSQL
- **Storage**: MinIO (S3-compatible object store)
- **Frontend**: React 19 + TypeScript, Vite, Axios

---

## Prerequisites

- Java 21
- Maven (or use the included `./mvnw`)
- Node.js 20+
- PostgreSQL running on `localhost:5434`
- Docker (for running MinIO and Redis)

---

## Environment variables

The application requires the following environment variables to be set before startup. **Never hardcode these values in any file.**

| Variable | Description |
|----------|-------------|
| `DB_PASSWORD` | PostgreSQL password for the `postgres` user |
| `ADMIN_PASSWORD` | Password for the built-in `admin` account |
| `USER_PASSWORD` | Password for the built-in `user` account |
| `JWT_SECRET` | Secret key used to sign JWT tokens — must be at least 32 characters |
| `MASTER_ENCRYPTION_KEY` | Master key used to wrap per-file encryption keys (envelope encryption) |
| `MINIO_ENDPOINT` | MinIO server URL, e.g. `http://localhost:9000` |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET` | MinIO bucket name, e.g. `securefiles` |
| `CORS_ORIGIN` | Allowed frontend origin, e.g. `http://localhost:5173` |
| `REDIS_HOST` | Redis server hostname, e.g. `localhost` |
| `REDIS_PORT` | Redis server port, e.g. `6379` |

Set them in your shell:

```bash
export DB_PASSWORD=your-db-password
export ADMIN_PASSWORD=your-admin-password
export USER_PASSWORD=your-user-password
export JWT_SECRET=your-secret-key-min-32-characters
export MASTER_ENCRYPTION_KEY=your-master-key-min-32-characters
export MINIO_ENDPOINT=http://localhost:9000
export MINIO_ACCESS_KEY=minioadmin
export MINIO_SECRET_KEY=minioadmin
export MINIO_BUCKET=securefiles
export CORS_ORIGIN=http://localhost:5173
export REDIS_HOST=localhost
export REDIS_PORT=6379
```

The app will fail to start with a clear error if any of these are missing.

---

## Startup order

Start services in this order — the backend will fail to start if PostgreSQL, MinIO, or Redis is not running:

1. PostgreSQL
2. MinIO
3. Redis
4. Backend (`./mvnw spring-boot:run`)
5. Frontend (`npm run dev`)

---

## Running Redis

Redis is used to store revoked JWT tokens so logout takes effect immediately.

```bash
docker run -d -p 6379:6379 --name redis redis:7
```

---

## Running MinIO

MinIO is an open-source S3-compatible object store used to store encrypted files. Run it with Docker:

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ":9001"
```

The app automatically creates the bucket on startup if it doesn't exist. The MinIO console is available at `http://localhost:9001`.

---

## Running the backend

```bash
cd securefiles
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

By default the frontend points to `http://localhost:8080`. To use a different backend URL, create a `frontend/.env.local` file:

```
VITE_API_URL=http://your-backend-url
```

---

## User roles

| Role | Upload | Download / List | Delete |
|------|--------|-----------------|--------|
| `admin` | yes | yes | yes |
| `user` | no | yes | no |

---

## Running tests

Tests require a live PostgreSQL instance and the following environment variables to be set: `DB_PASSWORD`, `ADMIN_PASSWORD`, `USER_PASSWORD`, `JWT_SECRET`.

```bash
cd securefiles
./mvnw test
```

---

## File upload limits

- Max file size: **10MB**
- Allowed types: images, audio, video, PDF, plain text

---

## Dependency notes

- **axios is pinned to `1.13.6`** (no `^` prefix) and should not be upgraded without manual review. Versions `1.14.1` and `0.30.4` were found to be compromised — they shipped a malicious dependency that acted as a Remote Access Trojan dropper. See [StepSecurity disclosure](https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan) for details.
