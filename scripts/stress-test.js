/**
 * Stress Testing – montée en charge progressive au-delà du nominal (exemple ~2 min pour le TD).
 * Trouver la limite et observer la récupération.
 * Requêtes sur des pages aléatoires : fournir TOTAL_ITEMS à l'exécution (ex. -e TOTAL_ITEMS=10000).
 *
 * Pour un test réel / production, préférer des paliers plus longs, par ex. :
 *   stages: [
 *     { duration: '2m', target: 50 },    // base
 *     { duration: '2m', target: 50 },
 *     { duration: '2m', target: 100 },   // montée
 *     { duration: '2m', target: 100 },
 *     { duration: '2m', target: 200 },
 *     { duration: '2m', target: 200 },
 *     { duration: '2m', target: 300 },   // vers la limite
 *     { duration: '3m', target: 300 },
 *     { duration: '3m', target: 0 },     // récupération
 *   ]
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
