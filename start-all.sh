#!/bin/bash
# Deeportal — Start All Services
# Saves PIDs to /tmp/deeportal.pids for easy cleanup

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"

echo "════════════════════════════════════════"
echo " Deeportal — Starting All Services"
echo "════════════════════════════════════════"

# 1. Check prerequisites
echo ""
echo "1. Checking prerequisites..."

# MySQL
if mysql.server status 2>/dev/null | grep -q "SUCCESS"; then
    echo "   ✅ MySQL running"
else
    echo "   ⚠️  MySQL not running. Starting..."
    mysql.server start 2>/dev/null || echo "   ❌ MySQL not available. Install: brew install mysql"
fi

# Create database if needed
mysql -u root -e "CREATE DATABASE IF NOT EXISTS deeportal" 2>/dev/null && echo "   ✅ Database 'deeportal' ready" || echo "   ⚠️  Could not create database"

# Redis
if redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo "   ✅ Redis running"
else
    echo "   ⚠️  Redis not running. Starting..."
    redis-server --daemonize yes 2>/dev/null && echo "   ✅ Redis started" || echo "   ⚠️  Redis not available. Install: brew install redis"
fi

# 2. Kill any existing processes on our ports
echo ""
echo "2. Cleaning ports..."
for port in 8080 5002 3000; do
    lsof -ti:$port | xargs kill -9 2>/dev/null && echo "   ✅ Port $port freed" || echo "   ✅ Port $port clear"
done
sleep 1

# 3. Start Flask Backend
echo ""
echo "3. Starting Flask backend (port 8080)..."
cd "$BASE_DIR/backend-deeportal"
python3 -m orchestrator.webapp --host 127.0.0.1 --port 8080 &
FLASK_PID=$!
echo "   ✅ Flask started (PID: $FLASK_PID)"

# 4. Start Swarm Backend
echo ""
echo "4. Starting Swarm backend (port 5002)..."
cd "$BASE_DIR/backend-swarm-deeportal"
echo "DATABASE_URL=mysql://root:@localhost:3306/deeportal" > .env
echo "REDIS_URL=redis://localhost:6379" >> .env
echo "DEEPSEEK_API_KEY=sk-test" >> .env
npx tsx src/index.ts &
SWARM_PID=$!
echo "   ✅ Swarm started (PID: $SWARM_PID)"

# 5. Start Frontend
echo ""
echo "5. Starting Frontend (port 3000)..."
cd "$BASE_DIR/frontend-deeportal"
npm run dev &
FRONTEND_PID=$!
echo "   ✅ Frontend started (PID: $FRONTEND_PID)"

# Save PIDs
echo "$FLASK_PID $SWARM_PID $FRONTEND_PID" > /tmp/deeportal.pids

# 6. Wait and verify
echo ""
echo "6. Waiting for services to start..."
sleep 5

echo ""
echo "════════════════════════════════════════"
echo " Service Status"
echo "════════════════════════════════════════"
curl -s -o /dev/null -w "Flask:    http://localhost:8080 — HTTP %{http_code}\n" http://127.0.0.1:8080/api/v1/internal/ingest-complete -X POST 2>/dev/null || echo "Flask:    ⚠️  Not responding yet"
curl -s -o /dev/null -w "Swarm:    http://localhost:5002 — HTTP %{http_code}\n" http://127.0.0.1:5002/health 2>/dev/null || echo "Swarm:    ⚠️  Not responding yet"
curl -s -o /dev/null -w "Frontend: http://localhost:3000 — HTTP %{http_code}\n" http://127.0.0.1:3000 2>/dev/null || echo "Frontend: ⚠️  Not responding yet"

echo ""
echo "To stop all: kill \$(cat /tmp/deeportal.pids)"
echo "════════════════════════════════════════"
