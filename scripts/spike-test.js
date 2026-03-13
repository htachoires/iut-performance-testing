/**
 * Spike Testing – pic de charge soudain (exemple ~2 min pour le TD).
 * Vérifier que le système tient un choc (ex. flash sale).
 * Requêtes sur des pages aléatoires : fournir TOTAL_ITEMS à l'exécution (ex. -e TOTAL_ITEMS=10000).
 *
 * Pour un test réel / production, préférer des durées plus longues, par ex. :
 *   stages: [
 *     { duration: '30s', target: 50 },   // warm-up
 *     { duration: '10s', target: 50 },   // palier de base
 *     { duration: '1m', target: 500 },   // pic brutal
 *     { duration: '2m', target: 500 },   // maintien du pic
 *     { duration: '1m', target: 0 },     // descente
 *   ]
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
