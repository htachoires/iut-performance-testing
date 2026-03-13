# k6 Performance Testing with InfluxDB 2 and Grafana

A ready-to-use **k6** load testing project that sends metrics to **InfluxDB 2** and visualizes them in **Grafana**. The stack uses current-generation components (2026): InfluxDB 2.x, Grafana 11.x, and k6 with the **xk6-output-influxdb** extension for real-time metrics.

## What’s Included

- **Four test scenarios** (each as a separate script):
  - **Spike testing** – sudden traffic spikes (e.g. flash sales, viral events)
  - **Stress testing** – stepwise load increase to find breaking point and recovery
  - **Load testing** – sustained load at expected production level
  - **Soak (endurance) testing** – long run at steady load to detect leaks and degradation
- **Configurable API URL** – you set the target API base URL via environment variable; no need to edit scripts.
- **Docker Compose stack**: InfluxDB 2 + Grafana (and optional k6 image with InfluxDB 2 output).
- **Grafana**: datasource and a k6 dashboard provisioned automatically.

## Prerequisites

- **Docker** and **Docker Compose**

## Quick Start

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- **`BASE_URL`** – base URL of the API you want to test (e.g. `https://api.example.com`). No trailing slash.
  - **Tests via Docker + API sur la machine** : avec `network_mode: host`, utilisez `BASE_URL=http://localhost:5054` (ou le port de votre app). Vérifiez que l’API écoute sur **toutes les interfaces** (`0.0.0.0:5054`), pas seulement `127.0.0.1`.

You can leave the default InfluxDB/Grafana values if you only run the stack locally with defaults.

### 2. Start the stack (InfluxDB + Grafana)

```bash
docker compose up -d
```

- **InfluxDB**: http://localhost:8086 (UI login: `admin` / value of `INFLUXDB_ADMIN_PASSWORD` in `.env`)  
- **Grafana**: http://localhost:3000 (anonymous access enabled: no login required)

### 3. Run a test and see results in Grafana

Build the k6 image (with InfluxDB 2 output) once, then run tests via Docker:

```bash
docker compose build k6
docker compose --profile run run --rm k6 run /scripts/load-test.js -o xk6-influxdb
```

Or use the helper scripts in the **`run/`** folder (same env and image; scripts switch to project root automatically):

**Windows (PowerShell):**
```powershell
.\run\run-load-test.ps1
.\run\run-spike-test.ps1
.\run\run-stress-test.ps1
.\run\run-soak-test.ps1
```

**Linux / macOS (bash):**
```bash
chmod +x run/run-*-test.sh
./run/run-load-test.sh
./run/run-spike-test.sh
./run/run-stress-test.sh
./run/run-soak-test.sh
```

### 4. Open Grafana

- **Dashboard k6** (lien direct) : [http://localhost:3000/d/k6-load-testing/k6-load-testing](http://localhost:3000/d/k6-load-testing/k6-load-testing)  
- Ou accédez à http://localhost:3000 puis **Dashboards → k6 → k6 Load Testing** (aucune connexion requise ; accès anonyme activé).  
- Métriques affichées : VUs, débit de requêtes, durée, échecs, etc.

A provisioned **InfluxDB-k6** datasource points to the same InfluxDB org/bucket/token as the stack. You can also import the community dashboard **“k6 influxdb 2.X”** (ID: **19431**) from Grafana.com for more panels.

## Test Scripts Overview

| Script            | Purpose |
|-------------------|--------|
| `scripts/load-test.js`   | **Load test** – ramp up to target load, hold, then ramp down. Validates behavior under expected production load. |
| `scripts/spike-test.js`  | **Spike test** – short ramp to very high load, sustain, then drop. Checks behavior under sudden traffic spikes. |
| `scripts/stress-test.js` | **Stress test** – stepwise increase (50 → 100 → 200 → 300 VUs) with plateaus. Finds limits and recovery. |
| `scripts/soak-test.js`   | **Soak test** – long run at constant load (default 2h sustain). Detects memory leaks and performance degradation over time. |

All scripts:

- Use **`BASE_URL`** from the environment (see `scripts/lib/config.js`).  
- Call `GET <BASE_URL>/get` by default (you can change the path in the script or extend `config.js`).  
- Define thresholds (e.g. failure rate, p95/p99 latency); adjust in each script if needed.  
- Send metrics to InfluxDB when run with `-o xk6-influxdb` (handled by the Docker setup).

You can change the path or add more requests by editing the scripts or the shared `scripts/lib/config.js`.

## Stack Details (2026-oriented)

- **InfluxDB 2.7** (Alpine) – time-series store for k6 metrics.  
  - Initialized with org, bucket, and admin token via env (see `.env.example`).  
  - Data retention: 7 days by default (configurable in `docker-compose.yml`).

- **Grafana 11.3** – visualization.  
  - **Provisioning**:  
    - **Datasource**: InfluxDB 2 (Flux), name `InfluxDB-k6`, uid `influxdb-k6`, using the same org/bucket/token as the Compose stack.  
    - **Dashboard**: “k6 Load Testing” in folder **k6** (VUs, request rate, duration, failures).  
  - If you change `INFLUXDB_ORG`, `INFLUXDB_BUCKET`, or `INFLUXDB_TOKEN` in `.env`, keep the same values for InfluxDB init and update the Grafana datasource (or the provisioning file under `grafana/provisioning/datasources/`) so they match.

- **k6** – load testing, run only via Docker.  
  - The `Dockerfile.k6` image builds k6 with the **xk6-output-influxdb** extension; metrics are sent to InfluxDB 2 with `-o xk6-influxdb`.

## Project Layout

```
.
├── docker-compose.yml       # InfluxDB 2, Grafana, and k6 service (profile: run)
├── Dockerfile.k6            # k6 + xk6-output-influxdb image
├── .env.example             # Copy to .env and set BASE_URL (and optionally InfluxDB/Grafana)
├── grafana/
│   └── provisioning/
│       ├── datasources/
│       │   └── influxdb.yml # InfluxDB 2 datasource for Grafana
│       └── dashboards/
│           ├── default.yml  # Dashboard provider
│           └── k6/
│               └── k6-load-testing.json
├── scripts/
│   ├── lib/
│   │   └── config.js        # BASE_URL and getApiUrl()
│   ├── load-test.js
│   ├── spike-test.js
│   ├── stress-test.js
│   └── soak-test.js
├── run/                     # Scripts pour lancer les tests (dossier dédié)
│   ├── run-load-test.ps1    # Windows
│   ├── run-load-test.sh     # Linux / macOS
│   ├── run-spike-test.ps1
│   ├── run-spike-test.sh
│   ├── run-stress-test.ps1
│   ├── run-stress-test.sh
│   ├── run-soak-test.ps1
│   └── run-soak-test.sh
└── README.md
```

## Customization

- **API URL and paths**: Set `BASE_URL` in `.env`. To hit different paths, edit the script or `getApiUrl(path)` in `scripts/lib/config.js`.
- **Thresholds and stages**: Edit the `options` and `stages` in each script (e.g. reduce soak duration from 2h to 30m for a quick run).
- **Grafana**: Change admin user/password and root URL via `.env`. Add more dashboards under `grafana/provisioning/dashboards/k6/` or import from Grafana.com (e.g. 19431).

## References

- [k6 docs – InfluxDB output](https://grafana.com/docs/k6/latest/results-output/real-time/influxdb/)  
- [xk6-output-influxdb](https://github.com/grafana/xk6-output-influxdb)  
- [Grafana dashboard 19431 – k6 InfluxDB 2.X](https://grafana.com/grafana/dashboards/19431)
