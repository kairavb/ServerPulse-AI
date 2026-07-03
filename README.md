# 🚀 ServerPulse AI + RocketRide

> AI-powered Linux Server Health Analyzer built with RocketRide.

ServerPulse AI helps developers and DevOps engineers quickly diagnose Linux server issues by analyzing uploaded server logs using an AI pipeline powered by RocketRide.

Instead of manually reading thousands of log lines across multiple services, simply upload your logs and receive a structured health report with likely root causes and recommended fixes.

---

# Problem

When a production Linux server starts failing, engineers often need to inspect logs from multiple places:

- journalctl
- nginx
- Docker
- PM2
- disk usage
- memory usage
- systemd services

Finding the actual root cause can take a long time.

ServerPulse AI automates this process.

---

# Features

✅ Upload multiple Linux server logs

✅ AI-generated server health score

✅ Root cause analysis

✅ Severity classification

✅ Suggested fixes

✅ Security observations

✅ Downloadable Markdown incident report

---

# Example Inputs

- journal.log
- nginx-error.log
- docker.log
- pm2.log
- free.txt
- df.txt
- systemctl.txt

Users may upload individual files or a ZIP archive.

---

# Example Output

Overall Health
82 / 100

Problems Found

- nginx returning 502 Bad Gateway
- Docker container repeatedly restarting
- Disk usage at 91%
- PM2 process consuming excessive memory

Likely Root Cause

The backend service repeatedly crashes because of memory exhaustion, causing nginx upstream failures.

Recommendations

- Restart the PM2 process
- Increase Node.js heap size
- Clean old log files
- Investigate container health checks

---

# Architecture

```
User Uploads Logs
        │
        ▼
React Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
RocketRide Pipeline
        │
        ▼
LLM Analysis
        │
        ▼
Structured Incident Report
```

---

# Tech Stack

Frontend

- React
- Vite
- Tailwind CSS

Backend

- FastAPI

AI Workflow

- RocketRide

LLM

- Gemini (or OpenAI)

Deployment

- Frontend → Vercel
- Backend → Railway / Render

---

# Folder Structure

```
serverpulse-ai/

frontend/

backend/

sample-logs/

README.md
```

---

# Future Improvements

- SSH directly into remote servers
- Live monitoring
- Grafana integration
- Docker Compose analyzer
- Kubernetes support
- Nginx configuration validation
- Security scoring
- Email incident reports

---

# Demo

1. Upload Linux logs.
2. RocketRide analyzes the logs.
3. Review the generated incident report.
4. Download the report.

---

Built with ❤️ using RocketRide.