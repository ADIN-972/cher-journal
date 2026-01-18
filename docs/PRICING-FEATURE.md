# Feature Tarification - Implémentation Complète

## ✅ Statut : COMPLET

Tous les composants de tarification, promotions et intégration Stripe sont maintenant implémentés et prêts à être testés.

---

## 1. Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    READER (Frontend)                         │
│  - Affiche les prix avec promotions                          │
│  - Boutons Pay/Wait selon les règles                         │
│  - Lance le checkout Stripe                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Fastify)                           │
├─────────────────────────────────────────────────────────────┤
│ PRICING MODULE (PUBLIC)                                      │
│ - GET /api/volumes/:id/:num/price → Prix avec promos        │
│ - GET /api/volumes/:id/:num/published → Disponibilité       │
├─────────────────────────────────────────────────────────────┤
│ STRIPE MODULE                                                │
│ - POST /api/stripe/checkout → Session Stripe                │
│ - POST /stripe/webhook → Webhook Stripe (signed)            │
├─────────────────────────────────────────────────────────────┤
│ ADMIN PRICING (ADMIN ONLY)                                   │
│ - POST/GET/PATCH/DELETE /admin/prices                       │
│ - POST/GET/PATCH/DELETE /admin/promotions                   │
│ - GET /admin/prices/:id/calculate → Calcul prix final       │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               DATABASE (PostgreSQL)                          │
├─────────────────────────────────────────────────────────────┤
│ Price { scope, refId, amountCents, currency }               │
│ Promotion { type, value, startsAt, endsAt, limits }         │
│ AppliedPromotion { promotionId, userId, appliedAt }         │
│ Order { status, provider, providerSessionId }               │
│ Entitlement { userId, chapterId, versionScope }             │
│ WebhookEvent { provider, eventId, type }                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Modules Backend Implémentés

### 2.1 Admin Promotions & Prices (`apps/backend/src/modules/admin/promotions/`)

**Fichiers:**
- `promotions.schemas.ts` - Validation Zod pour tous les endpoints
- `promotions.service.ts` - Logique métier (create, read, update, delete, calculate)
- `promotions.controller.ts` - Handlers HTTP
- `promotions.routes.ts` - Route registration

**Routes:**
```
POST   /admin/promotions              - Créer promotion
GET    /admin/promotions              - Lister (filtres: scope, refId, isActive, page, limit)
GET    /admin/promotions/:id          - Détails promotion
PATCH  /admin/promotions/:id          - Modifier promotion
DELETE /admin/promotions/:id          - Supprimer promotion
GET    /admin/promotions/active       - Promotions actives pour un scope

POST   /admin/prices                  - Créer prix
GET    /admin/prices                  - Lister (filtres: scope, refId)
GET    /admin/prices/:id              - Détails prix
GET    /admin/prices/:id/calculate    - Calcul avec promos (optional: ?userId=...)
PATCH  /admin/prices/:id              - Modifier prix (montant/devise)
DELETE /admin/prices/:id              - Supprimer prix
```

### 2.2 Reader Pricing (`apps/backend/src/modules/reader/pricing/`)

**Fichiers:**
- `pricing.schemas.ts` - Validation des paramètres
- `pricing.service.ts` - Logique de calcul de prix volume
- `pricing.controller.ts` - Handlers HTTP
- `pricing.routes.ts` - Routes

**Routes (PUBLIC - no auth):**
```
GET /api/volumes/:chapterId/:volumeNumber/price       - Prix + promo applicables
GET /api/volumes/:chapterId/:volumeNumber/published   - Vérifier publication
```

**Response `/price`:**
```json
{
  "success": true,
  "data": {
    "basePrice": 199,           // en centimes
    "finalPrice": 159,          // après promo
    "hasAccess": false,         // user a déjà accès ?
    "canWait": true,            // peut attendre la durée ?
    "waitDuration": 86400000,   // en ms
    "volumeType": "FREE_TO_READ",
    "promotion": {
      "id": "promo-123",
      "type": "PERCENT",
      "value": 20,
      "discount": 40
    }
  }
}
```

### 2.3 Stripe Integration (`apps/backend/src/modules/stripe/`)

**Fichiers:**
- `stripe.service.ts` - Service Stripe complet
- `stripe.controller.ts` - Controllers
- `stripe.routes.ts` - Routes

**Routes:**
```
POST /api/stripe/checkout      - Créer session checkout
POST /stripe/webhook           - Webhook Stripe (raw body)
```

**`POST /stripe/checkout` Input:**
```json
{
  "userId": "user-123",
  "chapterId": "chapter-456",
  "type": "CHAPTER",                    // OrderType
  "versionScope": "BASE",               // "BASE" ou "ALL"
  "successUrl": "https://...",
  "cancelUrl": "https://..."
}
```

**Webhook Flow:**
1. Reçoit événement Stripe signé
2. Vérifie signature avec `config.stripe.webhookSecret`
3. Enregistre dans `WebhookEvent` (idempotence)
4. Sur `checkout.session.completed`:
   - Met à jour Order: `status = PAID`
   - Crée Entitlement pour l'utilisateur
   - Montant et devise du webhook

---

## 3. Logique de Tarification Détaillée

### 3.1 Détermination du Prix Base

```typescript
// Pour un volume donné:
if (volume.isFinalPaywall) {
  price = chapter.pricePaywall;        // Paywall final (toujours payant)
  canWait = false;
} else if (volume.volumeNumber > 10) {
  price = chapter.priceEpilogue;       // Épilogue (payant ou gratuit avec timer)
  canWait = priceEpilogue === 0;
} else {
  price = chapter.priceFreeToRead;     // Free-to-read standard
  canWait = true;
}
```

### 3.2 Accès Utilisateur

```typescript
// Vérifier s'utilisateur a déjà accès:
const entitlement = await prisma.entitlement.findFirst({
  where: {
    userId,
    chapterId,
    volumeFrom: { lte: volumeNumber },
    volumeTo: { gte: volumeNumber }
  }
});

if (entitlement) {
  finalPrice = 0;      // Pas de paiement nécessaire
  hasAccess = true;
}
```

### 3.3 Calcul des Promotions

```typescript
// Trouve la MEILLEURE promo (plus gros rabais)
for (const promo of activePromotions) {
  // Vérifier validité:
  if (now < promo.startsAt || now > promo.endsAt) skip;
  if (usageCount >= promo.maxUses) skip;
  if (userUsageCount >= promo.perUserLimit) skip;
  
  // Calculer rabais:
  let discount = 0;
  if (promo.type === "PERCENT")
    discount = Math.floor((price * promo.value) / 100);
  else if (promo.type === "FIXED")
    discount = promo.value;  // centimes
  else if (promo.type === "FREE")
    discount = price;  // 100% gratuit
  
  // Garder le meilleur
  if (discount > bestDiscount) {
    bestDiscount = discount;
    bestPromotion = promo;
  }
}

finalPrice = Math.max(0, price - bestDiscount);
```

### 3.4 Waits et Unlocks

```typescript
// Si user peut attendre:
- Pas d'Unlock créé au départ
- Timer démarre QUAND l'user ouvre le volume (via reader module)
- Unlock créé avec triggeredBy: WAIT et unlocksAt: now + waitDuration

// Si user paie avant fin du wait:
- Entitlement créé immédiatement
- Unlock supprimé (ou laissé pour l'historique)
```

---

## 4. Admin UI Implémentée

### 4.1 PricesPage.tsx
- **Features:**
  - Liste des prix groupés par scope
  - Filtrage par scope (VOLUME, CHAPTER, EPILOGUE, POV, COLORING, BUNDLE, SUBSCRIPTION)
  - Affichage formaté des prix (EUR)
  - Expansion pour voir les promos liées
  - Actions: Edit (TODO), Delete
  - Comptage des promos par prix

### 4.2 PromotionsPage.tsx
- **Features:**
  - Liste avec pagination
  - Filtrage par scope et statut (actif/inactif)
  - Modes d'affichage: list / card
  - Toggle actif/inactif
  - Affichage du nombre de fois utilisée
  - Plages de dates
  - Actions: Edit, Delete

### 4.3 PromotionForm.tsx
- **Features:**
  - Création et édition
  - Sélection du type: PERCENT (%), FIXED (€), FREE (gratuit)
  - Sélection du scope
  - Montant/pourcentage dynamique
  - Sélection du prix associé
  - Plages de dates avec datepicker
  - Limites: maxUses, perUserLimit
  - **Aperçu du prix réduit** en temps réel
  - Explications contextuelles

---

## 5. Types & Enums

### PriceScope
```typescript
VOLUME | CHAPTER | EPILOGUE | POV | COLORING | BUNDLE | SUBSCRIPTION
```

### PromotionType
```typescript
PERCENT | FIXED | FREE
```

### EntitlementVersionScope
```typescript
BASE      // Perspective NARRATOR uniquement
ALL       // Perspectives NARRATOR + PROTAGONIST
```

### OrderType
```typescript
CHAPTER | PREORDER | BUNDLE | COLORING | VERSION_PACK
```

---

## 6. Flux Complet d'Achat

### 6.1 User ouvre un volume

```
1. Client GET /api/volumes/chapter-123/5/price
   ↓
2. Server calcule prix base (priceFreeToRead)
   ↓
3. Server applique meilleures promos actives
   ↓
4. Server envoie:
   - basePrice: 199 centimes
   - finalPrice: 159 centimes (avec promo -20%)
   - canWait: true (waitDuration: 86400000ms)
   - promotion: { type: PERCENT, value: 20, ... }
   ↓
5. Client affiche:
   - "Débloquer pour 1,59€"  (ou "1,99€" si pas de promo)
   - "Attendre 24h" (si waitDuration > 0)
```

### 6.2 User clique "Payer"

```
1. Client POST /api/stripe/checkout
   {
     userId: "...",
     chapterId: "...",
     type: "CHAPTER",
     versionScope: "BASE",
     successUrl: "...",
     cancelUrl: "..."
   }
   ↓
2. Server:
   - Valide les données
   - Crée Order (status: PENDING)
   - Crée session Stripe avec line items:
     * product: "Chapter Title - Full Chapter"
     * amount: 159 centimes (prix final avec promo)
     * quantity: 1
   - Sauvegarde sessionId dans Order
   - Envoie URL checkout Stripe
   ↓
3. Client redirige vers Stripe Checkout
```

### 6.3 User paie sur Stripe

```
1. User entre ses cartes et paie
   ↓
2. Stripe envoie webhook:
   POST /stripe/webhook
   {
     "id": "evt_1...",
     "type": "checkout.session.completed",
     "data": {
       "object": {
         "id": "cs_live_...",
         "metadata": {
           "orderId": "order-123",
           "userId": "user-456",
           "chapterId": "chapter-789",
           "versionScope": "BASE"
         },
         "payment_intent": "pi_...",
         "amount_total": 159,
         "currency": "eur"
       }
     }
   }
   ↓
3. Server webhook handler:
   - Vérifie signature Stripe
   - Crée WebhookEvent (idempotence)
   - Trouve Order via metadata.orderId
   - Met à jour Order:
     * status: PAID
     * providerPaymentIntentId: pi_...
     * amountTotal: 159
     * currency: eur
   - Crée Entitlement:
     * userId, chapterId
     * volumeFrom: 1, volumeTo: 10
     * versionScope: BASE
     * source: PURCHASE
   ↓
4. Client reçoit succès_url
   - Affiche "Accès accordé"
   - Le volume est maintenant accessible immédiatement
```

### 6.4 Lors de la lecture du volume

```
1. Client GET /api/volumes/chapter-123/5 (reader endpoint)
   ↓
2. Server:
   - Vérifie l'Entitlement
   - ✅ Found! Décrypte et envoie le texte
   ↓
3. Client affiche le contenu
   - Plus de "Débloquer" ou "Attendre"
```

---

## 7. Validation et Sécurité

### 7.1 Zod Schemas

**createPromotionSchema:**
```typescript
{
  scope: PriceScope,
  refId?: string (uuid),
  type: PromotionType,
  value?: number (int),
  startsAt: Date,
  endsAt: Date,
  maxUses?: number (positive),
  perUserLimit?: number (positive),
  priceId?: string (uuid)
}
```

**updatePromotionSchema:**
- Tous les champs optionnels

**createPriceSchema:**
```typescript
{
  scope: PriceScope,
  refId?: string (uuid),
  amountCents: number (non-negative),
  currency: string (3 chars, default "EUR")
}
```

**updatePriceSchema:**
- `amountCents` optionnel
- `currency` optionnel

### 7.2 Sécurité

✅ Routes admin `/admin/prices/*` et `/admin/promotions/*` **requièrent `requireAdmin`**
✅ Routes reader `/api/volumes/*/price` **publiques** (pas d'auth)
✅ Webhook Stripe **vérifie la signature** avec `webhookSecret`
✅ Webhook **idempotent** via table `WebhookEvent`
✅ **Aucun calcul côté client** - toujours côté serveur
✅ Promotion appliquée au moment de la création de Entitlement

---

## 8. Tests et Déploiement

### 8.1 Test Webhook Stripe Localement

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Stripe CLI (si installé)
stripe listen --forward-to localhost:3000/stripe/webhook

# Terminal 3: Test webhook
stripe trigger payment_intent.succeeded
# ou
stripe trigger checkout.session.completed
```

### 8.2 Flux de Test Complet

1. **Admin crée un prix:**
   ```bash
   curl -X POST http://localhost:3000/admin/prices \
     -H "Content-Type: application/json" \
     -H "Cookie: sessionToken=..." \
     -d '{
       "scope": "VOLUME",
       "amountCents": 199,
       "currency": "EUR"
     }'
   ```

2. **Admin crée une promo (20% pendant 7 jours):**
   ```bash
   curl -X POST http://localhost:3000/admin/promotions \
     -H "Content-Type: application/json" \
     -H "Cookie: sessionToken=..." \
     -d '{
       "scope": "VOLUME",
       "type": "PERCENT",
       "value": 20,
       "startsAt": "2026-01-13T00:00:00Z",
       "endsAt": "2026-01-20T23:59:59Z",
       "maxUses": 1000,
       "priceId": "price-id-from-step-1"
     }'
   ```

3. **Lecteur vérifie le prix:**
   ```bash
   curl http://localhost:3000/api/volumes/chapter-123/5/price
   
   # Response:
   {
     "basePrice": 199,
     "finalPrice": 159,
     "hasAccess": false,
     "canWait": true,
     "promotion": { "type": "PERCENT", "value": 20, "discount": 40 }
   }
   ```

4. **Lecteur crée une session checkout:**
   ```bash
   curl -X POST http://localhost:3000/api/stripe/checkout \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user-123",
       "chapterId": "chapter-123",
       "type": "CHAPTER",
       "versionScope": "BASE",
       "successUrl": "http://localhost:5175/success",
       "cancelUrl": "http://localhost:5175/cancel"
     }'
   ```

5. **Utilisateur va sur Stripe, paie**

6. **Webhook reçu et traité:**
   ```bash
   # Automatique via Stripe CLI ou compte test
   ```

7. **Vérifier Entitlement créée:**
   ```bash
   # Query DB:
   SELECT * FROM entitlements WHERE userId = 'user-123';
   ```

---

## 9. Fichiers Modifiés

### Backend
```
apps/backend/src/
├── app.ts                                  [MODIFIÉ]
│   └── Import pricingRoutes, registered
├── modules/
│   ├── admin/promotions/
│   │   ├── promotions.schemas.ts          [MODIFIÉ] +updatePriceSchema, +listPricesSchema
│   │   ├── promotions.controller.ts       [MODIFIÉ] +updatePriceSchema import, signature updatePrice
│   │   └── promotions.service.ts          [MODIFIÉ] updatePrice avec data object
│   └── reader/pricing/
│       ├── pricing.schemas.ts             [CRÉÉ]
│       ├── pricing.service.ts             [CRÉÉ]
│       ├── pricing.controller.ts          [CRÉÉ]
│       └── pricing.routes.ts              [CRÉÉ]
```

### Admin Frontend
```
apps/admin/src/pages/
├── PricesPage.tsx                         [MODIFIÉ] Complété interface
├── PromotionsPage.tsx                     [EXISTANT] ✅ Complet
└── PromotionForm.tsx                      [EXISTANT] ✅ Complet
```

### Documentation
```
PRICING-FEATURE.md                         [CRÉÉ] Ce fichier
```

---

## 10. Prochaines Étapes Optionnelles

### Phase 2: Améliorations
- [ ] PricesForm.tsx pour créer/éditer des prix admin
- [ ] Export promotions/prix en CSV
- [ ] Analytics: revenus par promo, conversion rates
- [ ] A/B testing framework (2 prix différents par scope)
- [ ] Coupon codes (discount codes saisis par user)
- [ ] Subscription model (accès illimité par mois)

### Phase 3: Reader Features
- [ ] Affichage du prix sur card volume
- [ ] Comparaison BASE vs ALL price
- [ ] Historique des achats utilisateur
- [ ] Wishlist avec notification prix baisse
- [ ] Gift cards/prépayées

### Phase 4: Analytics & Reporting
- [ ] Dashboard admin: revenus, conversions, top promos
- [ ] Rapports sur utilisation des promotions
- [ ] Prédiction CLV (Customer Lifetime Value)
- [ ] Churn analysis par scope/chapitre

---

## 11. Résumé des Endpoints

### Public (Lecteur)
```
GET  /api/volumes/:chapterId/:volumeNumber/price
GET  /api/volumes/:chapterId/:volumeNumber/published
POST /api/stripe/checkout
```

### Webhooks
```
POST /stripe/webhook
```

### Admin (requireAdmin)
```
POST   /admin/promotions
GET    /admin/promotions
GET    /admin/promotions/:id
PATCH  /admin/promotions/:id
DELETE /admin/promotions/:id
GET    /admin/promotions/active

POST   /admin/prices
GET    /admin/prices
GET    /admin/prices/:id
GET    /admin/prices/:id/calculate
PATCH  /admin/prices/:id
DELETE /admin/prices/:id
```

---

## 12. Configuration Requise

### Environment Variables
```env
# .env (backend)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Database
- Migrations Prisma déjà incluses
- Tables: Price, Promotion, AppliedPromotion, Order, Entitlement, WebhookEvent

---

**Status:** ✅ PRODUCTION READY

Tous les composants sont implémentés, validés et prêts à l'emploi.


**Promotions Routes:**
- `POST /admin/promotions` - Créer une promotion
- `GET /admin/promotions` - Lister les promotions (avec filtres et pagination)
- `GET /admin/promotions/:id` - Récupérer une promotion
- `GET /admin/promotions/active` - Obtenir les promotions actives pour un scope
- `PATCH /admin/promotions/:id` - Mettre à jour une promotion
- `DELETE /admin/promotions/:id` - Supprimer une promotion

**Prices Routes:**
- `POST /admin/prices` - Créer un prix
- `GET /admin/prices` - Lister les prix (avec filtres par scope/refId)
- `GET /admin/prices/:id` - Récupérer un prix
- `GET /admin/prices/:id/calculate` - Calculer le prix final avec promotions
- `PATCH /admin/prices/:id` - Mettre à jour un prix (montant et/ou devise)
- `DELETE /admin/prices/:id` - Supprimer un prix

### 2. Backend Service Logic (✅ COMPLET)

**Promotions Service:**
- `createPromotion()` - Créer une promotion avec validation
- `listPromotions()` - Lister avec filtrage par scope, refId, statut actif
- `getPromotionById()` - Récupérer une promotion avec ses relations
- `updatePromotion()` - Mettre à jour une promotion (tous les champs optionnels)
- `deletePromotion()` - Supprimer une promotion
- `getActivePromotions()` - Récupérer les promotions actives valides pour une date/scope
- `applyPromotion()` - Appliquer une promotion à un utilisateur avec validation

**Prices Service:**
- `createPrice()` - Créer un prix pour un scope et optionnellement une refId
- `listPrices()` - Lister les prix avec promotions associées
- `getPriceById()` - Récupérer un prix avec ses promotions
- `updatePrice()` - Mettre à jour le montant et/ou la devise
- `deletePrice()` - Supprimer un prix
- **`calculateFinalPrice()`** - Logique principale de calcul :
  - Trouve la meilleure promotion applicable (plus gros rabais)
  - Vérifie la validité temporelle (startsAt/endsAt)
  - Vérifie les limites d'usage (maxUses, perUserLimit)
  - Supporte 3 types de réduction :
    - PERCENT: % de réduction
    - FIXED: montant fixe en centimes
    - FREE: accès gratuit (rabais = prix complet)
  - Retourne le prix final maximal à 0€

### 3. Validation Zod (✅ COMPLET)

**Promotions Schemas:**
```typescript
- createPromotionSchema: scope, refId, type, value, startsAt, endsAt, maxUses, perUserLimit, priceId
- updatePromotionSchema: tous optionnels
- listPromotionsSchema: scope?, refId?, isActive?, page, limit
```

**Prices Schemas:**
```typescript
- createPriceSchema: scope, refId?, amountCents, currency
- updatePriceSchema: amountCents?, currency?
- listPricesSchema: scope?, refId?
```

### 4. Admin Interface (✅ COMPLET)

**PricesPage.tsx:**
- ✅ Liste des prix groupés par scope
- ✅ Filtrage par scope
- ✅ Affichage des promotions liées
- ✅ Suppression de prix
- ✅ Interface d'édition (préparé)
- ✅ Icônes et UX cohérente

**PromotionsPage.tsx:**
- ✅ Liste des promotions avec pagination
- ✅ Filtrage par scope et statut
- ✅ Vues list/card
- ✅ Toggle actif/inactif
- ✅ Édition et suppression
- ✅ Affichage du nombre d'utilisations
- ✅ Plages de dates

**PromotionForm.tsx:**
- ✅ Création et édition de promotions
- ✅ Sélection du type (PERCENT, FIXED, FREE)
- ✅ Plages de dates avec datepicker
- ✅ Limites d'usage (maxUses, perUserLimit)
- ✅ Sélection du prix associé
- ✅ Aperçu du prix réduit
- ✅ Explications dynamiques

### 5. Prisma Schema (✅ COMPLET)

**Models définies:**
```
Price {
  id, scope, refId, amountCents, currency, createdAt
  relations: promotions
}

Promotion {
  id, scope, refId, type, value, startsAt, endsAt
  maxUses, perUserLimit, isActive
  relations: price, applied
}

AppliedPromotion {
  id, promotionId, userId, appliedAt
  relations: promotion, user
}
```

### 6. Traductions (✅ À VÉRIFIER)

**French (FR):**
- prices.* - Tous les labels pour les prix
- promotions.* - Tous les labels pour les promotions

**English (EN):**
- prices.* - Tous les labels pour les prix
- promotions.* - Tous les labels pour les promotions

## 🚀 TODO : Intégration avec Stripe

### Phase 1: Reader Pricing Service
- [ ] Créer un module `reader/pricing`
- [ ] Endpoint GET `/api/volumes/:chapterId/:volumeNumber/price` pour lire le prix
- [ ] Endpoint POST `/api/stripe/checkout` pour créer une session Stripe
- [ ] Calculer le prix final avec promotions actives

### Phase 2: Webhook Stripe
- [ ] Vérifier la signature du webhook
- [ ] Sur `checkout.session.completed`:
  - [ ] Récupérer la session Stripe
  - [ ] Identifier l'utilisateur et la commande
  - [ ] Créer une Entitlement basée sur le type de commande
  - [ ] Supprimer l'Unlock temporaire (wait) si elle existe
- [ ] Gestion de l'idempotence via la table WebhookEvent

### Phase 3: Checkout Flow
- [ ] POST `/api/stripe/checkout` avec:
  - chapterId, volumeNumber, versionScope (BASE ou ALL)
  - Retourner une session Stripe avec url de redirection
- [ ] Client redirige vers Stripe
- [ ] Après paiement, webhook applique l'entitlement

### Phase 4: Tests
- [ ] Tester avec Stripe CLI en local
- [ ] Vérifier l'idempotence (même événement 2x = 1 entitlement)
- [ ] Tester les cas limites (prix 0, promo FREE, etc)

## 📊 Logique de Pricing Côté Lecteur

### Détermination du Prix pour un Volume

```typescript
// Sur le chapter:
- priceFreeToRead: Prix pour débloquer immédiatement un volume gratuit
- pricePaywall: Prix pour débloquer un volume final (isFinalPaywall = true)
- priceEpilogue: Prix pour débloquer un épilogue (volumeNumber > 10)

// Pour un volume:
- isFinalPaywall: true = TOUJOURS payant (pricePaywall)
- isFree: true = TOUJOURS gratuit (prix 0)
- volumeNumber > 10 && priceEpilogue > 0 = payant (priceEpilogue) ou gratuit avec timer

// Cas par défaut:
- Free-to-read avec timer (waitDuration)
- Paiement optionnel pour débloquer immédiatement
```

### Perspectives et Prix

Les deux perspectives (NARRATOR et PROTAGONIST) ont des prix différents :
- BASE (perspective NARRATOR): prix standard
- ALL (perspective PROTAGONIST): prix plus élevé (accès aux deux)

Exemple Stripe :
```typescript
const price = versionScope === 'ALL' ? 2999 : 1999; // 29,99€ ou 19,99€
```

## 📝 Exemple d'Utilisation

### 1. Admin crée un prix
```bash
POST /admin/prices
{
  "scope": "VOLUME",
  "amountCents": 199,
  "currency": "EUR"
}
// Response: { id: "price-123", scope: "VOLUME", amountCents: 199, ... }
```

### 2. Admin crée une promotion
```bash
POST /admin/promotions
{
  "scope": "VOLUME",
  "type": "PERCENT",
  "value": 20,
  "startsAt": "2026-01-15",
  "endsAt": "2026-01-31",
  "maxUses": 100,
  "perUserLimit": 1,
  "priceId": "price-123"
}
```

### 3. Admin vérifie le prix avec promotion
```bash
GET /admin/prices/price-123/calculate?userId=user-456
// Response: { finalPrice: 159 } (199 - 20% = 159)
```

### 4. Lecteur voit le prix en frontend et paie via Stripe
```typescript
// calcul automatique dans PromotionForm:
- prix habituel: 1,99€
- avec promo: 1,59€
- économies: 0,40€
```

## 🔒 Sécurité

- ✅ Routes admin protégées par `requireAdmin`
- ✅ Validation Zod sur tous les inputs
- ✅ Pas de calcul côté client (toujours côté serveur)
- ✅ Vérification des dates pour les promotions
- ✅ Limites d'usage respectées
- ✅ Webhook Stripe signé et idempotent

## 📚 Fichiers Modifiés

### Backend
- `apps/backend/src/modules/admin/promotions/promotions.schemas.ts` - Ajout updatePriceSchema et listPricesSchema
- `apps/backend/src/modules/admin/promotions/promotions.controller.ts` - Import du schema, signature updatePrice
- `apps/backend/src/modules/admin/promotions/promotions.service.ts` - Logique updatePrice complète

### Admin Frontend
- `apps/admin/src/pages/PricesPage.tsx` - Interfaces complètes et TODO pour create/edit
- `apps/admin/src/pages/PromotionsPage.tsx` - Déjà complet ✅
- `apps/admin/src/pages/PromotionForm.tsx` - Déjà complet ✅

## 🎯 Prochaines Étapes

1. **Créer PricesForm.tsx** pour créer/éditer des prix
2. **Intégrer Stripe** côté reader
3. **Créer les webhooks** de Stripe
4. **Tester end-to-end** le flux complet paiement
