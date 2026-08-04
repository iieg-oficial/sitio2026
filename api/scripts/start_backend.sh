#!/usr/bin/env bash
set -euo pipefail

cd /app



echo "▶️ Running database bootstrap (scripts/init_db.py)..."
python scripts/init_db.py
echo "✅ Database bootstrap completed."

if [ "${SEED_EXAMPLES:-false}" = "true" ]; then
    echo "🌱 SEED_EXAMPLES=true — Importing example CSV data..."
    python scripts/import_all_examples.py --mode upsert
    echo "✅ Example data import completed."
else
    echo "ℹ️  Skipping example CSV import (set SEED_EXAMPLES=true to enable)."
fi

if [ "${ENV:-production}" = "development" ]; then
    echo "🚀 Launching Uvicorn (development)..."
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "🚀 Launching Gunicorn + Uvicorn workers (production)..."
    exec gunicorn app.main:app \
        --bind 0.0.0.0:8000 \
        --workers "${GUNICORN_WORKERS:-2}" \
        --worker-class uvicorn.workers.UvicornWorker \
        --access-logfile - \
        --error-logfile - \
        --timeout 120 \
        --graceful-timeout 30 \
        --keep-alive 5
fi

