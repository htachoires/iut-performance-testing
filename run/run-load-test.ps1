# Run k6 Load Test via Docker (metrics → InfluxDB)
# Prereqs: .env with BASE_URL
# Ensures InfluxDB (and Grafana) are up before running the test
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot
docker compose up -d influxdb grafana
docker compose --profile run run --rm k6 run /scripts/load-test.js -o xk6-influxdb
