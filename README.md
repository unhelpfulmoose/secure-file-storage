# Secure File Storage & Delivery System
Examensarbete Java24 — A full-stack application for securely uploading, storing, and downloading files with AES-256 encryption at rest.

## Tech stack

- **Backend**: Java 21, Spring Boot 3.4.3, Spring Security, Spring Data JPA
- **Database**: PostgreSQL
- **Frontend**: React 19 + TypeScript, Vite, Axios

---

## Prerequisites

- Java 21
- Maven (or use the included `./mvnw`)
- Node.js 18+
- PostgreSQL running on `localhost:5434`

---

## Environment variables

The application requires the following environment variables to be set before startup. **Never hardcode these values in any file.**

| Variable | Description |
|----------|-------------|
| `DB_PASSWORD` | PostgreSQL password for the `postgres` user |
| `ADMIN_PASSWORD` | Password for the built-in `admin` account |
| `USER_PASSWORD` | Password for the built-in `user` account |

Set them in your shell:

```bash
export DB_PASSWORD=your-db-password
export ADMIN_PASSWORD=your-admin-password
export USER_PASSWORD=your-user-password
```

The app will fail to start with a clear error if any of these are missing.

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

---

## User roles

| Role | Upload | Download / List |
|------|--------|-----------------|
| `admin` | yes | yes |
| `user` | no | yes |

---

## Running tests

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
