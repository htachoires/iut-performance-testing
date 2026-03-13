# TD — Tests de performance (1h30)

**Objectif :** Mesurer l’impact du volume de données en base sur les temps de
réponse de l’API Books (projet **iut-integration-testing**), en utilisant les
quatre types de tests de charge du projet **iut-performance-testing** : **load
**, **spike**, **soak** et **stress**.

**Prérequis :**

- Les deux dépôts clonés : **iut-integration-testing** et *
  *iut-performance-testing**
- Docker (pour PostgreSQL via Aspire, InfluxDB, Grafana et k6)
- .NET 10 SDK

---

## Partie 1 — Contexte et mise en place (15 min)

### 1.1 Rappel de l’API Books

L’API (projet **iut-integration-testing**) expose notamment :

- `GET /books` — liste tous les livres (endpoint le plus sensible au volume)
- `GET /books/{id}` — un livre par id
- `POST /books` — création (body : `{ "title": "..." }`)

Les tests de performance ciblent `GET /books` pour observer la dégradation du
temps de réponse lorsque le nombre de livres en base augmente.

### 1.2 Types de tests utilisés

| Test       | Objectif                                                                         |
|------------|----------------------------------------------------------------------------------|
| **Load**   | Charge type « production » : montée progressive, palier, descente.               |
| **Spike**  | Pic de charge soudain (ex. flash sale) : vérifier que le système tient le choc.  |
| **Soak**   | Endurance : charge soutenue dans le temps (détection de fuites, dégradation).    |
| **Stress** | Montée progressive au-delà du nominal pour trouver la limite et la récupération. |

Pour tenir en **1h30**, les scripts sont des **exemples courts** (~2 min par
exécution) :  
`load-test.js`, `spike-test.js`, `soak-test.js`, `stress-test.js`.  
Chaque script indique en en-tête quelles durées utiliser pour un test réel ou
production.  
Ils appellent `GET /books?page=…&pageSize=…` en choisissant une **page
aléatoire** à chaque requête, en fonction du **nombre d’éléments en base** que
vous fournissez à l’exécution (voir partie 3.2).

### 1.3 Préparation des environnements

1. **Lancer l’API et la base** (depuis **iut-integration-testing**) :
   ```bash
   cd iut-integration-testing
   dotnet run --project AppHost
   ```
   Noter l’URL de l’API (ex. `http://localhost:5xxx`) affichée dans le tableau
   de bord Aspire (ressource **books-api**).

2. **Configurer le projet de tests de performance** (depuis *
   *iut-performance-testing**) :
   ```bash
   cp .env.example .env
   ```
   Éditer `.env` et définir **`BASE_URL`** avec l’URL de l’API (sans slash
   final), par ex. :

   ```bash
   BASE_URL=http://localhost:5054
   ```

   **`TOTAL_ITEMS`** (nombre d’éléments en base) est **obligatoire** à
   l’exécution : indiquez-le en argument des scripts (voir 3.2).

3. **Démarrer InfluxDB et Grafana** (optionnel mais recommandé pour les
   graphiques) :
   ```bash
   docker compose up -d influxdb grafana
   ```
   Grafana : http://localhost:3000 (dashboard k6 Load Testing).

---

## Partie 2 — Peuplement de la base via Aspire (10 min)

Le projet **iut-integration-testing** expose dans son **AppHost Aspire** quatre
ressources de seed (**seed-1k**, **seed-10k**, **seed-100k**, **seed-1M**) qui
peuvent insérer en base 1 000, 10 000, 100 000 ou 1 000 000 de livres. Ces
ressources ne démarrent **pas** automatiquement : c’est à vous de les lancer
quand vous en avez besoin.

### 2.1 Lancer un seed depuis le tableau de bord Aspire

1. Assurez-vous que l’AppHost est démarré (voir partie 1.3) :  
   `dotnet run --project AppHost` depuis **iut-integration-testing**.

2. Ouvrez le **tableau de bord Aspire** (l’URL s’affiche au lancement de
   l’AppHost).

3. Dans la liste des ressources, repérez :
   - **seed-1k** → 1 000 livres  
   - **seed-10k** → 10 000 livres  
   - **seed-100k** → 100 000 livres  
   - **seed-1M** → 1 000 000 livres  

4. Cliquez sur la ressource souhaitée (ex. **seed-10k**) puis sur **Start** (ou
   équivalent). Le script SeedBooks s’exécute avec la bonne connexion à la base
   (injectée par Aspire), vide la table **Books**, insère le nombre de livres
   demandé, puis s’arrête.

À chaque lancement, la table est vidée puis remplie. Vous pouvez enchaîner
avec une autre ressource (ex. seed-100k) pour changer le volume.

### 2.2 Vérification

**À faire :** Lancer **seed-1k** depuis le tableau de bord Aspire, attendre la
fin de l’exécution, puis vérifier avec `GET /books` (navigateur ou curl) que
la réponse contient bien environ 1 000 entrées.

---

## Partie 3 — Exécution des tests par type et par volume (45 min)

Pour chaque **volume** (1k, 10k, 100k, 1M), vous allez exécuter les **quatre**
tests (load, spike, soak, stress) et noter les métriques (temps de
réponse, débit, taux d’échec).

### 3.1 Ordre conseillé

Pour chaque volume, utilisez le **tableau de bord Aspire** (projet
**iut-integration-testing**) pour lancer la ressource de seed correspondante
(**seed-1k**, **seed-10k**, **seed-100k**, **seed-1M**) avant d’exécuter les
tests.

1. Seed **1 000** livres (Aspire : **seed-1k**) → lancer les 4 tests courts → noter les résultats.
2. Seed **10 000** (Aspire : **seed-10k**) → relancer les 4 tests → noter.
3. Seed **100 000** (Aspire : **seed-100k**) → relancer les 4 tests → noter.
4. Seed **1 000 000** (Aspire : **seed-1M**) → relancer les 4 tests → noter.

(Le seed 1M peut être lancé en début de séance depuis Aspire pour qu’il tourne
pendant que vous faites d’autres mesures.)

### 3.2 Lancer les tests

Depuis **iut-performance-testing**, avec `BASE_URL` déjà configuré dans `.env`.

**Important :** indiquez le **nombre d’éléments en base** (égal au volume du seed
que vous venez de lancer) pour que les scripts interrogent des **pages
aléatoires** réalistes. Par exemple après **seed-10k** : 10 000 livres → 100
pages (avec `pageSize=100`).

```bash
# S’assurer qu’InfluxDB et Grafana sont démarrés (pour les graphiques)
docker compose up -d influxdb grafana

# TOTAL_ITEMS est obligatoire (ex. 10 000 après seed-10k)
./run/run-load-test.sh 10000
./run/run-spike-test.sh 10000
./run/run-soak-test.sh 10000
./run/run-stress-test.sh 10000
```

### 3.3 Tableaux de résultats à remplir

Compléter les tableaux ci-dessous pour chaque combinaison **volume × type de
test**. Les métriques (p95, p99, taux d’échec, requêtes/s) s’affichent en fin
d’exécution k6 dans le terminal ; vous pouvez aussi les consulter dans Grafana (
dashboard k6 Load Testing) si vous avez lancé les tests avec `-o xk6-influxdb`.

**1 000 livres en base**

| Test   | p95 (ms) | p99 (ms) | Taux échec | Requêtes/s (approx.) |
|--------|----------|----------|------------|----------------------|
| Load   |          |          |            |                      |
| Spike  |          |          |            |                      |
| Soak   |          |          |            |                      |
| Stress |          |          |            |                      |

**10 000 livres en base**

| Test   | p95 (ms) | p99 (ms) | Taux échec | Requêtes/s (approx.) |
|--------|----------|----------|------------|----------------------|
| Load   |          |          |            |                      |
| Spike  |          |          |            |                      |
| Soak   |          |          |            |                      |
| Stress |          |          |            |                      |

**100 000 livres en base**

| Test   | p95 (ms) | p99 (ms) | Taux échec | Requêtes/s (approx.) |
|--------|----------|----------|------------|----------------------|
| Load   |          |          |            |                      |
| Spike  |          |          |            |                      |
| Soak   |          |          |            |                      |
| Stress |          |          |            |                      |

**1 000 000 livres en base**

| Test   | p95 (ms) | p99 (ms) | Taux échec | Requêtes/s (approx.) |
|--------|----------|----------|------------|----------------------|
| Load   |          |          |            |                      |
| Spike  |          |          |            |                      |
| Soak   |          |          |            |                      |
| Stress |          |          |            |                      |

