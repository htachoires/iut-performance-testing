/**
 * Stress Testing – find breaking point and recovery.
 * Gradually increases load beyond normal capacity to discover limits and behavior under failure.
 * Pattern: stepwise increase with plateaus to observe degradation.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getApiUrl } from './lib/config.js';

export const options = {
  stages: [
    { duration: '2m', target: 50 },    // ramp to baseline
    { duration: '2m', target: 50 },    // sustain
    { duration: '2m', target: 100 },   // step up
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },   // step up
    { duration: '2m', target: 200 },
    { duration: '2m', target: 300 },   // push toward limit
    { duration: '3m', target: 300 },
    { duration: '3m', target: 0 },     // ramp-down / recovery
  ],
  thresholds: {
    http_req_failed: ['rate<0.2'],
    http_req_duration: ['p(99)<5000'],
  },
};

export default function () {
  const url = getApiUrl('/books');
  const res = http.get(url);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
