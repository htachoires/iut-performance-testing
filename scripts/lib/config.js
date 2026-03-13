/**
 * Shared configuration for k6 scripts.
 * Set BASE_URL (e.g. https://api.example.com) before running tests.
 *
 * Pour les tests avec pagination aléatoire (tous les scripts) :
 * - TOTAL_ITEMS : obligatoire, nombre d'éléments en base (fourni à l'exécution)
 * - PAGE_SIZE   : taille de page (défaut 100), doit correspondre à l'API
 * Exemple (Docker) : ./run/run-load-test-short.sh 500
 */
export const BASE_URL = __ENV.BASE_URL || 'https://httpbin.test.k6.io';

/** Nombre d'éléments en base (env). Obligatoire pour les tests /books. */
export const TOTAL_ITEMS = __ENV.TOTAL_ITEMS ? parseInt(__ENV.TOTAL_ITEMS, 10) : null;

/** Taille de page pour /books (défaut 100). */
export const PAGE_SIZE = __ENV.PAGE_SIZE ? parseInt(__ENV.PAGE_SIZE, 10) : 100;

export function getApiUrl(path = '') {
  const base = BASE_URL.replace(/\/$/, '');
  const p = (path || '').replace(/^\//, '');
  return p ? `${base}/${p}` : base;
}

/**
 * Vérifie que TOTAL_ITEMS est défini et > 0. Sinon, lance une erreur (arrêt du test).
 */
export function requireTotalItems() {
  if (TOTAL_ITEMS == null || TOTAL_ITEMS <= 0) {
    throw new Error(
      'TOTAL_ITEMS est obligatoire. Indiquez le nombre d\'éléments en base. ' +
      'Exemple (Docker) : ./run/run-load-test-short.sh 1000'
    );
  }
}

/**
 * Nombre max de pages pour /books selon TOTAL_ITEMS et PAGE_SIZE.
 */
export function getMaxPage() {
  requireTotalItems();
  return Math.max(1, Math.ceil(TOTAL_ITEMS / PAGE_SIZE));
}

/**
 * Retourne l'URL d'une page aléatoire de /books.
 * TOTAL_ITEMS doit être défini (obligatoire).
 */
export function getRandomBooksPageUrl() {
  const maxPage = getMaxPage();
  const page = maxPage <= 1 ? 1 : Math.floor(Math.random() * maxPage) + 1;
  return getApiUrl(`/books?page=${page}&pageSize=${PAGE_SIZE}`);
}
