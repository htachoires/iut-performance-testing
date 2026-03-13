#!/bin/bash
# Run k6 Load Test via Docker (metrics → InfluxDB)
# Prereqs: .env with BASE_URL. TOTAL_ITEMS obligatoire (nombre d'éléments en base).
# Usage: ./run/run-load-test.sh TOTAL_ITEMS   (ex: ./run/run-load-test.sh 10000)
set -e
if [[ -z "${1:-}" ]]; then
  echo "Usage: $0 TOTAL_ITEMS" >&2
  echo "TOTAL_ITEMS est obligatoire (nombre d'éléments en base, ex: 10000)." >&2
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"
docker compose up -d influxdb grafana
docker compose --profile run run --rm -e "TOTAL_ITEMS=$1" k6 run /scripts/load-test.js -o xk6-influxdb
