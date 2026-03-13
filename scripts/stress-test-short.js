/**
 * Stress Testing (version courte ~2 min) – montée en charge progressive.
 * Utilisé pour le TD : même scénario que stress-test.js, durée réduite.
 * Requêtes sur des pages aléatoires : fournir TOTAL_ITEMS à l'exécution (ex. -e TOTAL_ITEMS=10000).
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getRandomBooksPageUrl } from './lib/config.js';

export const options = {
  stages: [
    { duration: '20s', target: 30 },
    { duration: '20s', target: 30 },
    { duration: '20s', target: 60 },
    { duration: '20s', target: 60 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.2'],
    http_req_duration: ['p(99)<6000'],
  },
};

export default function () {
  const url = getRandomBooksPageUrl();
  const res = http.get(url);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
