# Pricing Feature - Use Cases & Examples

## 📖 Cas d'Usage Réels

### UC1: Chapter à Accès Progressif

**Objectif:** Les 10 premiers volumes sont gratuits avec attente, les 5 derniers sont payants

**Configuration:**

```sql
-- Chapter "Le Clair-Obscur"
UPDATE chapters SET
  priceFreeToRead = 199,    -- 1,99€ pour débloquer immédiatement
  pricePaywall = 0,
  priceEpilogue = 399       -- 3,99€ pour les épilogues
WHERE id = 'chapter-001';

-- Volumes 1-10: priceFreeToRead (gratuit avec timer)
-- Volumes 11+: priceEpilogue (payant ou gratuit avec timer)
```

**Comportement:**
- User ouvre Vol. 5 → Peut attendre 24h gratuitement OU payer 1,99€
- User ouvre Vol. 11 → Peut attendre 24h gratuitement OU payer 3,99€
- User ouvre Vol. 15 → Peut attendre 24h gratuitement OU payer 3,99€

---

### UC2: Chapter Complètement Payant

**Objectif:** Tout le chapitre est payant (pas d'attente gratuite)

**Configuration:**

```sql
-- Chapter "L'Héritage"
UPDATE chapters SET
  priceFreeToRead = 0,
  pricePaywall = 0,
  priceEpilogue = 0
WHERE id = 'chapter-002';

-- Tous les volumes: isFinalPaywall = true
UPDATE volumes SET
  isFinalPaywall = true,
  pricePaywall = 299   -- 2,99€ par volume
WHERE chapterId = 'chapter-002';
```

**Comportement:**
- User ouvre n'importe quel volume → DOIT payer 2,99€
- Pas de timer, pas d'attente possible

---

### UC3: Promotion Lanceur

**Objectif:** Pendant les 3 premiers jours, 50% de rabais pour les nouveaux lecteurs

**Configuration:**

```bash
# Via API Admin
curl -X POST http://localhost:3000/admin/promotions \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=admin-token" \
  -d '{
    "scope": "VOLUME",
    "type": "PERCENT",
    "value": 50,
    "startsAt": "2026-01-13T00:00:00Z",
    "endsAt": "2026-01-16T23:59:59Z",
    "maxUses": 10000,
    "perUserLimit": 1,
    "priceId": "price-id-free-to-read"
  }'
```

**Résultat:**
- Prix normal: 1,99€
- Avec promo: 0,99€
- Chaque user: 1 fois seulement
- Pendant 3 jours

---

### UC4: Bundle Chapitre Complet

**Objectif:** Vendre l'accès à un chapitre entier à prix réduit

**Configuration:**

```sql
-- Créer un prix pour le bundle
INSERT INTO prices (scope, "refId", "amountCents", currency)
VALUES ('CHAPTER', 'chapter-003', 999, 'EUR');  -- 9,99€ au lieu de 24,75€ (10 × 1,99€ + 5 × 3,99€)

-- Créer une promo associée
INSERT INTO promotions (scope, type, value, "startsAt", "endsAt", "maxUses", "perUserLimit", "isActive", "priceId")
VALUES ('CHAPTER', 'FIXED', 0, now(), now() + interval '365 days', NULL, NULL, true, 'price-id-from-above');
```

**Comportement:**
- Affichage: "Débloquer tout le chapitre: 9,99€"
- Crée une Entitlement pour tous les volumes du chapitre
- Plus rapide que d'acheter volume par volume

---

### UC5: Promotion Black Friday (Fixe)

**Objectif:** -5€ sur chaque achat pendant 4 jours

**Configuration:**

```bash
curl -X POST http://localhost:3000/admin/promotions \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=admin-token" \
  -d '{
    "scope": "VOLUME",
    "type": "FIXED",
    "value": 500,           # 5€ = 500 centimes
    "startsAt": "2026-01-20T00:00:00Z",
    "endsAt": "2026-01-24T23:59:59Z",
    "maxUses": 50000,
    "perUserLimit": NULL,   # Pas de limite par user
    "priceId": "price-id"
  }'
```

**Résultat:**
- Prix normal: 1,99€
- Avec promo: max(0, 1,99€ - 5€) = 0€ ✅ GRATUIT!
- Tout le monde peut l'utiliser plusieurs fois

---

### UC6: Perspective NARRATOR vs PROTAGONIST

**Objectif:** Vendre 2 niveaux d'accès au même chapitre

**Configuration:**

```bash
# Créer session pour NARRATOR (BASE)
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "chapterId": "chapter-004",
    "type": "CHAPTER",
    "versionScope": "BASE",      # ← NARRATOR uniquement
    "successUrl": "...",
    "cancelUrl": "..."
  }'

# Créer session pour NARRATOR + PROTAGONIST (ALL)
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "chapterId": "chapter-004",
    "type": "CHAPTER",
    "versionScope": "ALL",       # ← Les 2 perspectives
    "successUrl": "...",
    "cancelUrl": "..."
  }'
```

**Résultat:**
- User 1 paie pour BASE: voir perspective NARRATOR
- User 2 paie pour ALL: voir perspective NARRATOR + PROTAGONIST
- Entitlement stocke le `versionScope` pour la vérification d'accès

---

## 💰 Stratégies de Monétisation

### Stratégie 1: Progressive Revenue

```
Volume 1-5:   Gratuit + timer (24h)       → Accroche
Volume 6-10:  1,99€                       → Premium
Volume 11-15: 3,99€ (épilogue)            → Ultra Premium
Perspectives: +10€ pour PROTAGONIST       → Contenu exclusif
```

**Attente attendue:**
- Conversion ~5-10% des lecteurs gratuits
- ARPU: ~2,50€ par lecteur payant

### Stratégie 2: Launch Blitz

```
J0-3:   50% rabais                        → Vague initiale
J4-14:  Prix normal                       → Monétisation
J15+:   10% rabais permanent              → Rétention
```

**Attente:**
- Pic de ventes J0-J3
- Puis stabilisation autour de la baseline
- ARPU: ~1,50€

### Stratégie 3: Bundling

```
Bundle chapitre:    9,99€  (vs 24,75€)    → 60% rabais
Bundle saison (5ch): 39,99€ (vs 123,75€)  → 68% rabais
Bundle annuel:      99,99€ (vs 247,50€)   → 60% rabais
```

**Avantage:**
- Réduction du friction (1 paiement au lieu de 50)
- Meilleur LTV (Life Time Value)

### Stratégie 4: Freemium Dynamique

```
Gratuit: Chapitres 1-3 intégralement
Payant: Chapitres 4+ (choix volume par volume)
All-Access: 19,99€/mois (tous les chapitres)
```

**Avantage:**
- Familiariser sans friction
- Upsell vers subscription

---

## 📊 Exemples d'Exécution

### Exemple 1: Démarrage Simple

**Jour 1:**
```bash
# 1. Créer 1 prix
POST /admin/prices
{ "scope": "VOLUME", "amountCents": 99 }

# 2. Créer 1 promo (gratuit les 7 jours)
POST /admin/promotions
{ 
  "scope": "VOLUME",
  "type": "FREE",
  "startsAt": "2026-01-13",
  "endsAt": "2026-01-20",
  "maxUses": 100000
}

# 3. Resultat: 
# - Prix normal: 0,99€
# - Pendant 7 jours: GRATUIT
# - Après: 0,99€ de nouveau
```

### Exemple 2: Escalade Progressive

```
JOUR 1-7    → GRATUIT (tous les volumes)
JOUR 8-30   → 0,99€ (volumes, timer 24h)
JOUR 31-90  → 1,99€ (volumes, timer 12h)
JOUR 91+    → 2,99€ (volumes, pas de timer)
```

**Implémentation:**
```sql
-- 1. Créer 1 prix à 2,99€
INSERT INTO prices VALUES (..., 299);

-- 2. Créer 4 promotions
INSERT INTO promotions VALUES (..., "FREE", NULL, "2026-01-13", "2026-01-20", ...);  -- J1-7
INSERT INTO promotions VALUES (..., "FIXED", 200, "2026-01-21", "2026-02-17", ...);  -- J8-30: -2€
INSERT INTO promotions VALUES (..., "FIXED", 100, "2026-02-18", "2026-04-15", ...);  -- J31-90: -1€
-- Jour 91+: pas de promo = prix normal 2,99€
```

### Exemple 3: Promotion Limite

```bash
# Promo: -20% max 10 utilisateurs
POST /admin/promotions
{
  "scope": "VOLUME",
  "type": "PERCENT",
  "value": 20,
  "maxUses": 10,          # ← Seulement 10 achats
  "startsAt": "2026-01-13",
  "endsAt": "2026-01-14"
}
```

**Résultat:**
- Les 10 premiers achètent: 1,59€ (-20%)
- Après: revient au prix normal 1,99€
- Scarcité = urgence d'acheter

---

## 🧮 Calculs d'Impact

### Impact d'une Promo 20% PERCENT

```
Prix base:              1,99€
Rabais 20%:             0,40€
Nouveau prix:           1,59€
Reduction %:            20%
Prix complet perdu:     Non (moins cher = plus de volume)
```

### Impact d'une Promo 50€ FIXED

```
Prix base:              1,99€
Rabais fixe:            0,50€
Nouveau prix:           1,49€
Reduction %:            25%
Maximum valeur:         1,99€ (ne peut pas dépasser le prix)
```

### Impact d'une Promo FREE

```
Prix base:              1,99€
Rabais:                 1,99€ (prix complet)
Nouveau prix:           0,00€
Reduction %:            100%
Cas d'usage:            Launch/Teaser
```

---

## 🔐 Cas Limites à Tester

### Cas 1: Prix 0€
```json
{
  "amountCents": 0,
  "promotion": null
}
→ Gratuit pour tous
→ Pas de Stripe checkout
→ Accès immédiat
```

### Cas 2: Promo > Prix
```
Prix:                   1,99€ (199 centimes)
Promo FIXED:            3€ (300 centimes)
Résultat:               max(0, 199 - 300) = 0€ → GRATUIT
```

### Cas 3: User atteint perUserLimit
```
Promo.perUserLimit:     1
User a déjà acheté:     1 fois
Tentative n°2:          ❌ "User has reached promotion usage limit"
```

### Cas 4: Promo expirée
```
Promo.endsAt:           2026-01-15 23:59:59 UTC
Now:                    2026-01-16 00:00:00 UTC
Résultat:               ❌ Promo n'est plus valide
```

### Cas 5: maxUses atteint
```
Promo.maxUses:          100
Uses actuelles:         100
Tentative n°101:        ❌ "Promotion has reached maximum uses"
```

---

## 📈 Analytics à Implémenter (Future)

### Métriques Clés
- Conversion par scope (VOLUME vs CHAPTER vs etc)
- Revenue par jour
- Top 10 promos par revenue
- Abandoned checkout rate
- Average Order Value (AOV)
- Customer Lifetime Value (CLV)

### Queries Utiles

```sql
-- Revenue total
SELECT SUM("amountTotal") / 100.0 as revenue_eur FROM orders WHERE status = 'PAID';

-- Revenue par jour
SELECT DATE("createdAt"), COUNT(*), SUM("amountTotal") / 100.0 as revenue_eur
  FROM orders WHERE status = 'PAID'
  GROUP BY DATE("createdAt") ORDER BY DATE("createdAt") DESC;

-- Top chapters
SELECT ch.title, COUNT(e.id) as purchases, SUM(o."amountTotal") / 100.0 as revenue_eur
  FROM entitlements e
  JOIN chapters ch ON e."chapterId" = ch.id
  JOIN orders o ON o.id = e.id  -- si relation existe
  GROUP BY ch.id, ch.title
  ORDER BY revenue_eur DESC;

-- Top promos
SELECT p.id, p.type, p.value, COUNT(ap.id) as usage_count,
  SUM(CASE WHEN p.type = 'PERCENT' THEN FLOOR(pr."amountCents" * p.value / 100)
           WHEN p.type = 'FIXED' THEN p.value
           WHEN p.type = 'FREE' THEN pr."amountCents"
      END) / 100.0 as total_discount_eur
  FROM promotions p
  LEFT JOIN "appliedPromotions" ap ON ap."promotionId" = p.id
  LEFT JOIN prices pr ON p."priceId" = pr.id
  GROUP BY p.id, p.type, p.value
  ORDER BY usage_count DESC;
```

---

## 🎯 Recommandations Stratégiques

1. **Démarrer simple:** 1 prix, 1 promo gratuite pour lancer
2. **Tester progressivement:** Commencer par petits rabais (10-20%)
3. **Monitorer l'impact:** Vérifier conversion rate + feedback utilisateurs
4. **Ajuster les prix:** Basé sur demand vs supply
5. **Utiliser scarcité:** Promos avec `maxUses` limité = urgence
6. **Segmenter:** Prix différents par chapitre/public
7. **Récompenser fidélité:** Promos pour entitlements existants
8. **Tester perspectives:** ALL peut valoir 50-100% plus cher que BASE

---

**Prêt à lancer?** Voir `PRICING-QUICKSTART.md` pour démarrer rapidement.
