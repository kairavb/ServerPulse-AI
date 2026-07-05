# ServerPulse AI

AI-powered Linux server health analyzer. Upload diagnostic logs, run them through a **RocketRide** pipeline with **Gemini**, and get a structured incident report with health score, severity, issues, and recommendations.

**Stack:** React · Vite · Tailwind · FastAPI · RocketRide · Gemini

---

## How RocketRide Is Used

ServerPulse does **not** call Gemini directly from the browser. The FastAPI backend owns the RocketRide integration:

```
Browser  →  POST /analyze (log files)
FastAPI  →  bundle logs into a labeled prompt
         →  RocketRideClient.connect()
         →  client.use("pipeline/serverpulse.pipe")
         →  client.chat(question=prompt)   # chat source pipeline
         →  client.disconnect()
         →  parse structured JSON  →  API response
```

**Pipeline** (`backend/pipeline/serverpulse.pipe`) — one Gemini pass for fast analysis:

```
Upload Logs → Analyze Logs (gemini-2.5-flash) → Return Report
```

Analysis instructions live in `backend/app/prompts/log_analysis.py` and are sent with the uploaded log context. RocketRide still owns the chat source, LLM node, and response wiring.

The backend sends logs as chat context with a short user question; it does not orchestrate stages itself.

RocketRide credentials (`ROCKETRIDE_URI`, `ROCKETRIDE_APIKEY`) and the Gemini key (`ROCKETRIDE_GEMINI_KEY`) stay on the server.

**Supported log files:** `journal.log`, `nginx-error.log`, `docker.log`, `pm2.log`, `free.txt`, `df.txt`, `systemctl.txt`

---



## Quick Start



### Prerequisites

- Python 3.12+, Node 20+
- [RocketRide engine](https://github.com/rocketride-org/rocketride-server) running (default `http://localhost:5565`)
- Gemini API key



### 1. RocketRide engine

From the **repo root**, run:

```bash
./scripts/start-rocketride.sh
```

This stops any old container on port 5565 (including runs without a data volume), mounts `.data/rocketride` → `/opt/data`, and waits until the engine is ready.

Or manually:

```bash
mkdir -p .data/rocketride && chmod 777 .data/rocketride
docker rm -f rocketride-engine
docker run -d --name rocketride-engine -p 5565:5565 \
  -v "$(pwd)/.data/rocketride:/opt/data" \
  ghcr.io/rocketride-org/rocketride-engine:latest
```

Set `ROCKETRIDE_APIKEY=MYAPIKEY` in `backend/.env` (default dev key for the local engine).



### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # ROCKETRIDE_APIKEY=MYAPIKEY, set ROCKETRIDE_GEMINI_KEY
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)**, upload logs, click **Analyze**.

### Tests

```bash
cd backend && pip install -r requirements-dev.txt && pytest
cd frontend && npm run build
```

---



## Docker Start (everything at once)

Runs RocketRide engine, backend, and frontend together.

**Before first run**, bootstrap the RocketRide data directory (same as manual setup):

```bash
mkdir -p .data/rocketride && chmod 777 .data/rocketride
cp .env.example .env
# Edit .env — set ROCKETRIDE_GEMINI_KEY (ROCKETRIDE_APIKEY defaults to MYAPIKEY)
```

If RocketRide has never started on this machine, run the helper script once so the engine can finish its first-time setup with network access:

```bash
./scripts/start-rocketride.sh
# stop the standalone container if you only want compose:
docker rm -f rocketride-engine
```

Then start the full stack:

```bash
docker compose up --build
```

Compose mounts `./.data/rocketride` into the RocketRide container (shared with the manual script). On a **fresh empty volume**, the engine needs outbound network/DNS on first boot to install dependencies — if `rocketride` keeps restarting with `Failed to install wheel`, run `./scripts/start-rocketride.sh` first, then `docker compose up`.


| Service    | URL                                                      |
| ---------- | -------------------------------------------------------- |
| Frontend   | [http://localhost:3000](http://localhost:3000)           |
| Backend    | [http://localhost:8000](http://localhost:8000)           |
| API docs   | [http://localhost:8000/docs](http://localhost:8000/docs) |
| RocketRide | [http://localhost:5565](http://localhost:5565)           |


Stop: `docker compose down`

---



## API Reference

Base URL: `http://localhost:8000` (or your deployed backend)

### `GET /health`

Liveness check.

**Response** `200`

```json
{ "status": "ok" }
```

---



### `POST /analyze`

Analyze uploaded Linux server logs.

**Content-Type:** `multipart/form-data`


| Field   | Type   | Required | Description                     |
| ------- | ------ | -------- | ------------------------------- |
| `files` | file[] | yes      | One or more supported log files |


**Supported filenames:** `journal.log`, `nginx-error.log`, `docker.log`, `pm2.log`, `free.txt`, `df.txt`, `systemctl.txt`

**Limits (configurable via env):** 20 files max · 25 MB total · 120 s analysis timeout

**Response** `200`

```json
{
  "health_score": 82,
  "severity": "Medium",
  "summary": "Memory exhaustion is causing PM2 restarts and nginx 502 errors.",
  "issues": [
    {
      "title": "nginx returning 502 Bad Gateway",
      "severity": "High",
      "source": "nginx",
      "detail": "Upstream connection refused on port 3000.",
      "evidence": "connect() failed (111: Connection refused) while connecting to upstream"
    }
  ],
  "recommendations": [
    "Restart the PM2 backend process",
    "Increase Node.js heap size"
  ]
}
```


| Field             | Type     | Description                                |
| ----------------- | -------- | ------------------------------------------ |
| `health_score`    | integer  | Overall health, 0–100                      |
| `severity`        | string   | `Low` · `Medium` · `High` · `Critical`     |
| `summary`         | string   | Overall assessment and likely root cause   |
| `issues`          | array    | Detected problems with optional `evidence` |
| `recommendations` | string[] | Actionable fixes                           |


**Errors**


| Status | Meaning                                              |
| ------ | ---------------------------------------------------- |
| `400`  | Invalid upload (empty file, wrong name, size limit)  |
| `502`  | RocketRide unreachable or LLM response parse failure |
| `504`  | Analysis timed out                                   |
| `500`  | Unexpected server error                              |


**Example (curl)**

```bash
curl -X POST http://localhost:8000/analyze \
  -F "files=@journal.log" \
  -F "files=@nginx-error.log"
```

---

