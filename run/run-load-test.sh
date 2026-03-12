#!/bin/bash
# Run k6 Load Test via Docker (metrics → InfluxDB)
# Prereqs: .env with BASE_URL. Ensures InfluxDB and Grafana are up before running.
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"
docker compose up -d influxdb grafana
docker compose --profile run run --rm k6 run /scripts/load-test.js -o xk6-influxdb
