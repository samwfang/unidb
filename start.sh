#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

trap 'kill 0' EXIT INT TERM

echo "Starting backend (python3 api.py)..."
( cd backend && source ../env/bin/activate && python3 api.py ) &
BACKEND_PID=$!

sleep 2

echo "Starting frontend (npm start)..."
( cd frontend && npm start ) &
FRONTEND_PID=$!

wait
