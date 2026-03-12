# Run k6 Stress Test via Docker (metrics → InfluxDB)
# Prereqs: .env with BASE_URL
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot
docker compose up -d influxdb grafana
docker compose --profile run run --rm k6 run /scripts/stress-test.js -o xk6-influxdb
