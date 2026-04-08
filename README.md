# Secure File Storage & Delivery System
Examensarbete Java24 — A full-stack application for securely uploading, storing, and downloading files with AES-256 encryption at rest.

## Getting started

```bash
git clone https://github.com/your-username/secure-file-storage.git
cd secure-file-storage
```

Then follow the steps below to start all required services and run the app.

---

## Tech stack

- **Backend**: Java 21, Spring Boot 3.4.3, Spring Security (JWT), Spring Data JPA, Flyway
- **Database**: PostgreSQL
- **Storage**: MinIO (S3-compatible object store)
- **Frontend**: React 19 + TypeScript, Vite, Axios

---

## Recommended tools

- **Backend**: [IntelliJ IDEA Community Edition](https://www.jetbrains.com/idea/download/) — open the `securefiles/` folder as a Maven project
- **Frontend**: [Visual Studio Code](https://code.visualstudio.com/) — open the `frontend/` folder

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
| `ADMIN_PASSWORD` | Password for the built-in `admin` account |
| `USER_PASSWORD` | Password for the built-in `user` account |
| `JWT_SECRET` | Secret key used to sign JWT tokens — must be at least 32 characters |
| `MASTER_ENCRYPTION_KEY` | A secret key used to protect the encryption keys for each file — treat it like a strong password, min 32 characters |
| `MINIO_ENDPOINT` | MinIO server URL, e.g. `http://localhost:9000` |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET` | MinIO bucket name, e.g. `securefiles` |
| `CORS_ORIGIN` | Allowed frontend origin, e.g. `http://localhost:5173` |
| `REDIS_HOST` | Redis server hostname, e.g. `localhost` |
| `REDIS_PORT` | Redis server port, e.g. `6379` |

### Option A — IntelliJ (recommended for backend)

You set the variables once in IntelliJ and they are used every time you run the backend from there.

1. Open the `securefiles/` project in IntelliJ
2. Click **Run → Edit Configurations...**
3. Select your Spring Boot run configuration (or create one if it doesn't exist: click **+** → **Spring Boot**, set Main class to `com.eva.securefiles.SecurefilesApplication`)
4. Find the **Environment variables** field and click the icon on the right to open the editor
5. Add each variable as `NAME=value`:

```
DB_PASSWORD=your-db-password
ADMIN_PASSWORD=your-admin-password
USER_PASSWORD=your-user-password
JWT_SECRET=your-secret-key-min-32-characters
MASTER_ENCRYPTION_KEY=your-master-key-min-32-characters
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=securefiles
CORS_ORIGIN=http://localhost:5173
REDIS_HOST=localhost
REDIS_PORT=6379
```

6. Click **OK**

### Option B — Terminal

If you prefer the terminal, run these export commands before starting the backend. Note that they only last for the current terminal session — you'll need to run them again if you open a new terminal.

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
`export` commands are silent — no output means it worked. To verify a variable was set:
```bash
echo $DB_PASSWORD
```
The app will fail to start with a clear error if any of these are missing.

---

## Startup order

Start services in this order — the backend will fail to start if PostgreSQL, MinIO, or Redis is not running:

1. PostgreSQL
2. MinIO
3. Redis
4. Backend — press the green play button in IntelliJ, or run `./mvnw spring-boot:run` in the terminal from the `securefiles/` folder
5. Frontend — run `npm run dev` in a terminal (VS Code's built-in terminal works well) from the `frontend/` folder

---

## Running PostgreSQL

The app expects PostgreSQL on port `5434` (not the default 5432 — this avoids conflicts if you already have PostgreSQL installed). Run it with Docker:

```bash
docker run -d -p 5434:5432 --name postgres -e POSTGRES_PASSWORD=your-db-password -e POSTGRES_DB=securefiles postgres:16
```

Replace `your-db-password` with whatever you set for `DB_PASSWORD`. The app connects as user `postgres` to a database named `securefiles`. Flyway will create the tables automatically on first startup.

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
docker run -d -p 9000:9000 -p 9001:9001 --name minio -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin quay.io/minio/minio server /data --console-address ":9001"
```

The app automatically creates the bucket on startup if it doesn't exist. The MinIO console is available at `http://localhost:9001`.

---

## Subsequent startups

The `docker run` commands above only need to be run once — they create the containers. On future startups, just start the existing containers:

```bash
docker start postgres redis minio
```

To check if they are already running:
```bash
docker ps
```

---

## Running the backend

**IntelliJ:** Press the green play button. Make sure your run configuration has all environment variables set (see above).

**Terminal:**

If you get a "permission denied" error, first run:
```bash
chmod +x mvnw
```
Then:
```bash
cd securefiles
./mvnw spring-boot:run
```

The terminal must stay open while the backend is running. The backend is ready when you see `Started SecurefilesApplication` in the output.

The API will be available at `http://localhost:8080`.

---

## Running the frontend

**VS Code:** Open the `frontend/` folder, then open the built-in terminal (**Terminal → New Terminal**) and run:

```bash
npm install
npm run dev
```

**Any terminal:**
```bash
cd frontend
npm install
npm run dev
```

`npm install` only needs to be run once (or after pulling new changes). After that, `npm run dev` is enough.

The terminal must stay open while the frontend is running.

The frontend will be available at `http://localhost:5173`.

By default the frontend points to `http://localhost:8080`. To use a different backend URL, create a `frontend/.env.local` file:

```
VITE_API_URL=http://your-backend-url
```

---

## User roles

| Role | Upload | List / Preview / Download | Delete |
|------|--------|--------------------------|--------|
| `admin` | yes | yes | yes |
| `user` | no | yes | no |

---

## Logging in

Once everything is running, open `http://localhost:5173` in your browser. Use these credentials:

| Username | Password | Role |
|----------|----------|------|
| `admin` | value of `ADMIN_PASSWORD` | Can upload, preview, download, and delete files |
| `user` | value of `USER_PASSWORD` | Can preview and download files |

You choose the passwords yourself when setting the environment variables.

---

## What a successful startup looks like

- PostgreSQL, MinIO, and Redis are running (Docker containers show as `Up`)
- The backend starts without errors and prints something like `Started SecurefilesApplication`
- The frontend opens at `http://localhost:5173` and shows a login form

If the backend fails to start, check that all environment variables are set and that all three services are running before the backend.

---

## Running tests

Tests require a live PostgreSQL instance and the following environment variables to be set: `DB_PASSWORD`, `ADMIN_PASSWORD`, `USER_PASSWORD`, `JWT_SECRET`.

**IntelliJ:** Right-click the `src/test` folder and choose **Run All Tests**. Make sure your run configuration has the required environment variables set.

**Terminal:**
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

> **FYI — axios version pin:** axios is locked to `1.13.6` (no `^` prefix in `package.json`). Versions `1.14.1` and `0.30.4` were found to be compromised — they shipped a malicious dependency that acted as a Remote Access Trojan dropper. See [StepSecurity disclosure](https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan) for details. Don't upgrade axios without checking the version is safe first.
