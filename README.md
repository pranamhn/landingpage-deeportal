# Deeportal — Frontend

> Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript 5
> Unified UI layer for Deeportal.ai

---

## Overview

**frontend-deeportal** is the user-facing web application. It renders Flask (company data) and Swarm (AI predictions) into a single experience.

```
frontend-deeportal (Next.js :3000)
  ├── /api/*        → backend-deeportal (Flask :8080)
  └── /v1/swarm/*   → backend-swarm-deeportal (Express :5002)
```

---

## Quick Start

### One Command

```bash
./start-all.sh     # Starts all 3 services
./stop-all.sh      # Stops all 3 services
```

### Prerequisites
- Node.js 20+, Python 3.9+, MySQL (localhost:3306, db: deeportal), Redis (localhost:6379)

### Manual (3 terminals)
```bash
# Terminal 1
cd ../backend-deeportal && python3 -m orchestrator.webapp --host 127.0.0.1 --port 8080

# Terminal 2
cd ../backend-swarm-deeportal && echo "DATABASE_URL=mysql://root:@localhost:3306/deeportal" > .env && npx tsx src/index.ts

# Terminal 3
cd frontend-deeportal && npm install && npm run dev
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 5.6 |
| HTTP | Axios |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/companies` | Company directory |
| `/investors` | Investor directory |
| `/swarm` | Swarm predictions |
| `/swarm/new` | New prediction |
| `/swarm/playground` | Agent playground |
| `/swarm/marketplace` | Prediction marketplace |
| `/population` | Population intelligence |
| `/population/[regionCode]` | Region profile |
| `/population/segment` | Segment builder |
| `/political` | Political intelligence |

---

## Connected Repos

| Repo | Role | Port |
|------|------|------|
| [backend-deeportal](https://github.com/pranamhn/backend-deeportal) | Company data engine | 8080 |
| [backend-swarm-deeportal](https://github.com/pranamhn/backend-swarm-deeportal) | AI prediction engine | 5002 |
