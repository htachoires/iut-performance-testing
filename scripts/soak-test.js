/**
 * Soak / Endurance – charge soutenue dans le temps (exemple ~2 min pour le TD).
 * Détection de fuites mémoire, dégradation sur la durée.
 * Requêtes sur des pages aléatoires : fournir TOTAL_ITEMS à l'exécution (ex. -e TOTAL_ITEMS=10000).
 *
 * Pour un test réel / production, préférer une durée d'endurance longue, par ex. :
 *   stages: [
 *     { duration: '5m', target: 50 },    // ramp-up
 *     { duration: '2h', target: 50 },   // palier long (ou 30min–1h en CI)
 *     { duration: '5m', target: 0 },     // ramp-down
 *   ]
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getRandomBooksPageUrl } from './lib/config.js';

export const options = {
  stages: [
    { duration: '30s', target: 40 },
    { duration: '1m', target: 40 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000', 'p(99)<4000'],
  },
};

export default function () {
  const url = getRandomBooksPageUrl();
  const res = http.get(url);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
