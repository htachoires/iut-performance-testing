/**
 * Load Testing (version courte ~2 min) – charge type production.
 * Utilisé pour le TD : même scénario que load-test.js, durée réduite.
 * Requêtes sur des pages aléatoires : fournir TOTAL_ITEMS à l'exécution (ex. -e TOTAL_ITEMS=10000).
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getRandomBooksPageUrl } from './lib/config.js';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000', 'p(99)<4000'],
  },
};

export default function () {
  const url = getRandomBooksPageUrl();
  const res = http.get(url);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
