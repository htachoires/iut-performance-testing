/**
 * Spike Testing – sudden traffic spikes.
 * Verifies the system can handle abrupt increases in load (e.g. flash sales, viral events).
 * Pattern: low → very high load in a short time, then ramp-down.
 * Requêtes sur des pages aléatoires : TOTAL_ITEMS obligatoire à l'exécution.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getRandomBooksPageUrl } from './lib/config.js';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // warm-up
    { duration: '10s', target: 50 },   // steady baseline
    { duration: '1m', target: 500 },   // sharp spike
    { duration: '2m', target: 500 },   // sustain spike
    { duration: '1m', target: 0 },     // quick ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<3000'],
  },
};

export default function () {
  const url = getRandomBooksPageUrl();
  const res = http.get(url);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.5);
}
