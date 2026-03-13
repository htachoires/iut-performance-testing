/**
 * Soak (Endurance) Testing – prolonged run at steady load.
 * Detects memory leaks, resource exhaustion, and degradation over time.
 * Pattern: short ramp-up → long sustained load → ramp-down.
 * Requêtes sur des pages aléatoires : TOTAL_ITEMS obligatoire à l'exécution.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getRandomBooksPageUrl } from './lib/config.js';

export const options = {
  stages: [
    { duration: '5m', target: 50 },     // ramp-up
    { duration: '2h', target: 50 },    // sustained load (adjust duration as needed)
    { duration: '5m', target: 0 },     // ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
  },
};

export default function () {
  const url = getRandomBooksPageUrl();
  const res = http.get(url);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
