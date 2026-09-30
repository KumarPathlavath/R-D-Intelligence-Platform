#!/usr/bin/env bash
set -e

# ==============================================================================
# TechIntel Hub — Startup Script (Frontend + API Engine)
# ==============================================================================

echo "========================================================================"
echo "⚡ R&D Signal Intelligence — Continuous Innovation Engine"
echo "========================================================================"

PORT=${PORT:-8000}

# Free port if already in use
OCCUPIED_PID=$(lsof -ti :$PORT 2>/dev/null || true)
if [ -n "$OCCUPIED_PID" ]; then
    echo ">> Freeing occupied port $PORT (PID $OCCUPIED_PID)..."
    kill -9 $OCCUPIED_PID 2>/dev/null || true
    sleep 0.5
fi

# Detect Python interpreter
if [ -d ".venv" ] && [ -f ".venv/bin/python3" ]; then
    PYTHON_CMD=".venv/bin/python3"
else
    PYTHON_CMD="python3"
fi

echo ">> Checking frontend build..."
if [ ! -d "frontend/dist" ] || [ ! -f "frontend/dist/index.html" ]; then
    echo ">> Building frontend production bundle..."
    cd frontend && npm install && npm run build && cd ..
fi

echo ">> Starting TechIntel API Server & Web UI on http://localhost:${PORT}..."
exec $PYTHON_CMD src/api_server.py $PORT
