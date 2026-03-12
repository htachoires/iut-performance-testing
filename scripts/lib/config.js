/**
 * Shared configuration for k6 scripts.
 * Set BASE_URL (e.g. https://api.example.com) before running tests.
 */
export const BASE_URL = __ENV.BASE_URL || 'https://httpbin.test.k6.io';

export function getApiUrl(path = '') {
  const base = BASE_URL.replace(/\/$/, '');
  const p = (path || '').replace(/^\//, '');
  return p ? `${base}/${p}` : base;
}
