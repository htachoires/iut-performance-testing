#!/bin/bash
# Run k6 Spike Test via Docker (metrics → InfluxDB)
# Prereqs: .env with BASE_URL
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"
docker compose up -d influxdb grafana
docker compose --profile run run --rm k6 run /scripts/spike-test.js -o xk6-influxdb
