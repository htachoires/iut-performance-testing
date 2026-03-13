/**
 * Spike Testing (version courte ~2 min) – pic de charge soudain.
 * Utilisé pour le TD : même scénario que spike-test.js, durée réduite.
 * Requêtes sur des pages aléatoires : fournir TOTAL_ITEMS à l'exécution (ex. -e TOTAL_ITEMS=10000).
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getRandomBooksPageUrl } from './lib/config.js';

export const options = {
  stages: [
    { duration: '15s', target: 30 },
    { duration: '10s', target: 30 },
    { duration: '30s', target: 150 },
    { duration: '30s', target: 150 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<5000'],
  },
};

export default function () {
  const url = getRandomBooksPageUrl();
  const res = http.get(url);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.5);
}
