#!/bin/bash
# Run k6 Stress Test (version courte ~2 min) via Docker.
# Les requêtes ciblent des pages aléatoires. TOTAL_ITEMS obligatoire.
# Usage : ./run/run-stress-test-short.sh TOTAL_ITEMS
set -e
if [[ -z "${1:-}" ]]; then
  echo "Usage: $0 TOTAL_ITEMS" >&2
  echo "TOTAL_ITEMS est obligatoire (nombre d'éléments en base, ex: 10000)." >&2
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"
docker compose up -d influxdb grafana
docker compose --profile run run --rm -e "TOTAL_ITEMS=$1" k6 run /scripts/stress-test-short.js -o xk6-influxdb
