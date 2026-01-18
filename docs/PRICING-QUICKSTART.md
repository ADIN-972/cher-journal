# Pricing Feature - Quick Start Guide

## 🚀 Démarrage Rapide

### 1. Configuration de Base

#### Variables d'environnement (`.env` backend)
```env
# Stripe (obtenir sur https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. Base de Données

```bash
# Si ce n'est pas déjà fait:
npm run prisma:migrate:dev
npm run prisma:seed
```

### 3. Lancer le Backend et Admin

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Admin (React)
npm run dev:admin
```

Accès:
- Backend: http://localhost:3000
- Admin: http://localhost:5175

---

## 📊 Workflow Complet

### Phase 1: Admin Configure les Prix

1. **Aller à http://localhost:5175 → Admin → Prices**
   - ✅ La page affiche les prix existants

2. **Créer un prix** (via API pour l'instant):
```bash
curl -X POST http://localhost:3000/admin/prices \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=your-admin-token" \
  -d '{
    "scope": "VOLUME",
    "amountCents": 199,
    "currency": "EUR"
  }'
```

3. **Aller à Admin → Promotions**
   - ✅ L'interface est complète

4. **Créer une promotion**:
```bash
curl -X POST http://localhost:3000/admin/promotions \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=your-admin-token" \
  -d '{
    "scope": "VOLUME",
    "type": "PERCENT",
    "value": 20,
    "startsAt": "2026-01-13T00:00:00Z",
    "endsAt": "2026-01-20T23:59:59Z",
    "maxUses": 100,
    "perUserLimit": 1,
    "priceId": "price-id-from-step-2"
  }'
```

### Phase 2: Vérifier les Prix

```bash
# Vérifier le prix d'un volume (PUBLIC)
curl http://localhost:3000/api/volumes/chapter-123/5/price

# Response:
{
  "success": true,
  "data": {
    "basePrice": 199,
    "finalPrice": 159,
    "hasAccess": false,
    "canWait": true,
    "waitDuration": 86400000,
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

### Phase 3: Tester le Checkout Stripe

#### Avec Stripe CLI (test local):

```bash
# 1. Installer Stripe CLI: https://stripe.com/docs/stripe-cli

# 2. Login
stripe login

# 3. Écouter les webhooks
stripe listen --forward-to localhost:3000/stripe/webhook

# 4. Déclencher un test (dans un autre terminal)
stripe trigger checkout.session.completed

# 5. Vérifier la réception dans les logs du backend
```

#### Avec Compte Stripe Test:

```bash
# 1. POST pour créer une session checkout
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "chapterId": "chapter-456",
    "type": "CHAPTER",
    "versionScope": "BASE",
    "successUrl": "http://localhost:5175/success",
    "cancelUrl": "http://localhost:5175/cancel"
  }'

# 2. Copier l'URL "url" du response
# 3. Aller sur l'URL dans le navigateur
# 4. Utiliser les cartes de test Stripe:
#    - 4242 4242 4242 4242 (succès)
#    - Exp: 12/26, CVC: 123
# 5. Payer et confirmer

# 6. Vérifier que:
#    - Order est créée avec status=PAID
#    - Entitlement créée pour l'utilisateur
#    - WebhookEvent enregistrée
```

---

## 🔍 Vérification Rapide

### Via Database (psql)

```sql
-- Voir les prix
SELECT id, scope, "amountCents", currency FROM prices LIMIT 5;

-- Voir les promotions
SELECT id, scope, type, value, "isActive" FROM promotions LIMIT 5;

-- Voir les commandes
SELECT id, "userId", type, status, "amountTotal" FROM orders LIMIT 5;

-- Voir les entitlements
SELECT id, "userId", "chapterId", "volumeFrom", "volumeTo" 
  FROM entitlements LIMIT 5;

-- Voir les webhooks reçus
SELECT id, provider, type, "receivedAt" FROM webhook_events LIMIT 5;
```

### Via API

```bash
# Admin: Lister tous les prix
curl http://localhost:3000/admin/prices \
  -H "Cookie: sessionToken=admin-token"

# Admin: Lister toutes les promotions
curl http://localhost:3000/admin/promotions \
  -H "Cookie: sessionToken=admin-token"

# Admin: Calculer prix final avec promotions
curl http://localhost:3000/admin/prices/price-id/calculate \
  -H "Cookie: sessionToken=admin-token"

# Public: Vérifier le prix d'un volume
curl http://localhost:3000/api/volumes/chapter-id/5/price
```

---

## 📝 Scénarios de Test

### Scénario 1: Free-to-Read avec Timer

**Setup:**
- Volume: `volumeNumber=5`, `isFinalPaywall=false`
- Chapter: `priceFreeToRead=199`, `pricePaywall=0`, `priceEpilogue=0`

**Résultat attendu:**
```json
{
  "basePrice": 199,
  "finalPrice": 159,    // avec promo 20%
  "hasAccess": false,
  "canWait": true,
  "waitDuration": 86400000
}
```

### Scénario 2: Paywall Final

**Setup:**
- Volume: `volumeNumber=10`, `isFinalPaywall=true`
- Chapter: `pricePaywall=299`

**Résultat attendu:**
```json
{
  "basePrice": 299,
  "hasAccess": false,
  "canWait": false     // ✅ Paywall: pas d'attente
}
```

### Scénario 3: Épilogue Payant

**Setup:**
- Volume: `volumeNumber=11`, `isFinalPaywall=false`
- Chapter: `priceEpilogue=399`

**Résultat attendu:**
```json
{
  "basePrice": 399,
  "hasAccess": false,
  "canWait": false     // ✅ Épilogue payant: pas d'attente
}
```

### Scénario 4: User a Déjà Accès

**Setup:**
- Entitlement existe: `volumeFrom=1, volumeTo=10`
- Volume demandée: `volumeNumber=5`

**Résultat attendu:**
```json
{
  "basePrice": 199,
  "finalPrice": 0,     // ✅ Pas de paiement
  "hasAccess": true,
  "canWait": false
}
```

### Scénario 5: Promo FIXED

**Setup:**
- Prix: 199 centimes
- Promo: `type=FIXED, value=50` (0,50€ de rabais)

**Résultat attendu:**
```json
{
  "basePrice": 199,
  "finalPrice": 149,   // 199 - 50
  "promotion": {
    "type": "FIXED",
    "value": 50,
    "discount": 50
  }
}
```

### Scénario 6: Promo FREE

**Setup:**
- Prix: 199 centimes
- Promo: `type=FREE`

**Résultat attendu:**
```json
{
  "basePrice": 199,
  "finalPrice": 0,     // ✅ Accès gratuit
  "promotion": {
    "type": "FREE",
    "discount": 199    // Rabais = prix complet
  }
}
```

---

## 🐛 Troubleshooting

### Erreur: "Promotion is not active"
- Vérifier que `startsAt <= now <= endsAt`
- Vérifier que `isActive=true`

### Erreur: "User has reached promotion usage limit"
- La promo a un `perUserLimit` et l'utilisateur l'a déjà atteint

### Erreur: "Promotion has reached maximum uses"
- Le `maxUses` de la promo est atteint globalement

### Webhook Stripe non reçu
- Vérifier que `STRIPE_WEBHOOK_SECRET` est correct
- Vérifier que Stripe CLI est lancé avec `--forward-to`
- Vérifier les logs du backend

### Entitlement pas créée après paiement
- Vérifier que le webhook a bien été reçu
- Vérifier la table `webhook_events` pour voir si l'événement est là
- Vérifier que `checkout.session.completed` est le bon event type

---

## 📚 Structure des Fichiers

```
apps/backend/src/modules/
├── admin/promotions/
│   ├── promotions.schemas.ts      ← Validation
│   ├── promotions.service.ts      ← Logique métier
│   ├── promotions.controller.ts   ← Handlers HTTP
│   └── promotions.routes.ts       ← Routes
├── reader/pricing/
│   ├── pricing.schemas.ts         ← Validation
│   ├── pricing.service.ts         ← Calcul prix
│   ├── pricing.controller.ts      ← Handlers HTTP
│   └── pricing.routes.ts          ← Routes
└── stripe/
    ├── stripe.service.ts          ← Logique Stripe
    ├── stripe.controller.ts       ← Handlers
    └── stripe.routes.ts           ← Routes

apps/admin/src/pages/
├── PricesPage.tsx                 ← Liste des prix
├── PromotionsPage.tsx             ← Gestion promotions
└── PromotionForm.tsx              ← Form création/édition
```

---

## ✅ Checklist de Déploiement

- [ ] Variables d'env `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` configurées
- [ ] Migrations Prisma exécutées (`npm run prisma:migrate:deploy`)
- [ ] Backend démarré et fonctionnel
- [ ] Admin accessible et connecté
- [ ] Premiers tests d'API réussis
- [ ] Webhook Stripe configuré dans dashboard Stripe
- [ ] Comptes de test Stripe prêts (cartes de test)

---

## 🔗 Liens Utiles

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Stripe Dashboard](https://dashboard.stripe.com)

---

**Besoin d'aide?**
Voir `PRICING-FEATURE.md` pour la documentation complète.
