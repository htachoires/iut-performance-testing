/**
 * Load Testing – expected production load.
 * Validates performance under typical/normal load (response times, throughput, error rate).
 * Pattern: ramp-up → sustained load → ramp-down.
 * Requêtes sur des pages aléatoires : TOTAL_ITEMS obligatoire à l'exécution.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getRandomBooksPageUrl } from './lib/config.js';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // ramp-up to target load
    { duration: '5m', target: 100 },   // sustained load
    { duration: '2m', target: 0 },     // ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
  },
};

export default function () {
  const url = getRandomBooksPageUrl();
  const res = http.get(url);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
