# Système de Tarification - Documentation de Référence

## Vue d'ensemble

Ce document décrit le système complet de tarification pour Cher Journal. Il doit être utilisé comme référence par tous les composants : backend, admin, web, et mobile.

---

## Architecture des Prix

### 1. PriceSchema (Schéma de Prix Global)

Le **PriceSchema** définit les prix par défaut pour tous les types de volumes.

#### Structure
```typescript
{
  id: string;
  name: string;
  description?: string;

  // Prix par type (en centimes)
  priceFreeToRead: number;  // Défaut: 199 (€1.99)
  pricePaywall: number;     // Défaut: 299 (€2.99)
  priceEpilogue: number;    // Défaut: 399 (€3.99)

  // Métadonnées
  isActive: boolean;
  appliedFrom: DateTime;
  appliedTo?: DateTime;
  createdAt: DateTime;
  createdBy: string;
}
```

#### Règles
- **UN SEUL schéma actif** à la fois
- Le schéma actif s'applique à tous les chapitres par défaut
- Vérification de validité : `isActive = true` ET `appliedFrom <= now` ET (`appliedTo = null` OU `appliedTo >= now`)

#### Récupération du Schéma Actif
```typescript
// Service: priceSchemaService.getActiveSchema()
const activeSchema = await prisma.priceSchema.findFirst({
  where: {
    isActive: true,
    appliedFrom: { lte: new Date() },
    OR: [
      { appliedTo: null },
      { appliedTo: { gte: new Date() } }
    ]
  },
  orderBy: { appliedFrom: 'desc' }
});
```

---

### 2. ChapterPriceOverride (Surcharges par Chapitre)

Permet de définir des prix spécifiques pour un chapitre donné.

#### Structure
```typescript
{
  id: string;
  chapterId: string;        // UNIQUE - Un seul override par chapitre
  schemaId: string;         // Lien vers le schéma de base

  // Surcharges optionnelles (NULL = utiliser le prix du schéma)
  priceFreeToRead?: number | null;
  pricePaywall?: number | null;
  priceEpilogue?: number | null;

  reason?: string;          // Raison de l'exception

  // Métadonnées
  isActive: boolean;
  appliedFrom: DateTime;
  appliedTo?: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Règles
- **Un override par chapitre maximum**
- Si override existe ET `isActive = true` : utiliser les prix surchargés
- Si prix surchargé = `null` : utiliser le prix du schéma
- Vérification de validité identique au PriceSchema

#### Récupération des Prix d'un Chapitre
```typescript
// Service: priceSchemaService.getChapterPrices(chapterId)

// 1. Chercher un override actif pour ce chapitre
const override = await prisma.chapterPriceOverride.findUnique({
  where: { chapterId },
  include: { schema: true }
});

if (override && override.isActive) {
  return {
    priceFreeToRead: override.priceFreeToRead ?? override.schema.priceFreeToRead,
    pricePaywall: override.pricePaywall ?? override.schema.pricePaywall,
    priceEpilogue: override.priceEpilogue ?? override.schema.priceEpilogue,
    schemaId: override.schema.id,
    overrideId: override.id,
    isOverride: true
  };
}

// 2. Sinon, utiliser le schéma actif
const activeSchema = await priceSchemaService.getActiveSchema();
return {
  priceFreeToRead: activeSchema.priceFreeToRead,
  pricePaywall: activeSchema.pricePaywall,
  priceEpilogue: activeSchema.priceEpilogue,
  schemaId: activeSchema.id,
  overrideId: null,
  isOverride: false
};
```

---

### 3. Promotion (Système de Réductions)

#### Structure
```typescript
{
  id: string;
  name: string;
  description?: string;
  scope: PriceScope;        // VOLUME, CHAPTER, EPILOGUE, POV, COLORING, BUNDLE, SUBSCRIPTION
  refId?: string;           // ID de la ressource ciblée

  // Type de promotion
  type: PromotionType;      // PERCENT, FIXED, FREE
  value?: number;           // Valeur (% ou centimes)

  // Période de validité
  startsAt: DateTime;
  endsAt: DateTime;

  // Limitations
  maxUses?: number;         // Nombre total d'utilisations
  perUserLimit?: number;    // Limite par utilisateur

  // Ciblage
  targetType: PromotionTargetType;  // ALL_USERS, SPECIFIC_USERS, CRITERIA_BASED
  targetUserIds: string[];          // Si SPECIFIC_USERS
  targetCriteria?: Json;            // Si CRITERIA_BASED

  // Métadonnées
  isActive: boolean;
  code?: string;            // Code promo (ex: "SUMMER2024", optionnel)
  createdAt: DateTime;
  updatedAt: DateTime;
  createdBy?: string;

  // Relations
  priceId?: string;
}
```

#### Types de Promotion

##### PERCENT (Pourcentage)
```typescript
discount = Math.floor((basePrice * promotion.value) / 100);
finalPrice = basePrice - discount;

// Exemple: 20% de réduction sur €2.99
// discount = Math.floor((299 * 20) / 100) = 59 centimes
// finalPrice = 299 - 59 = 240 centimes (€2.40)
```

##### FIXED (Montant fixe)
```typescript
discount = promotion.value;
finalPrice = Math.max(0, basePrice - discount);

// Exemple: 50 centimes de réduction sur €2.99
// finalPrice = 299 - 50 = 249 centimes (€2.49)
```

##### FREE (Gratuit)
```typescript
discount = basePrice;
finalPrice = 0;
```

#### Vérifications de Validité

##### 1. Période de validité
```typescript
const now = new Date();
if (now < promotion.startsAt || now > promotion.endsAt) {
  // Promotion non valide
}
```

##### 2. Limite d'utilisations globale
```typescript
if (promotion.maxUses) {
  const usageCount = await prisma.appliedPromotion.count({
    where: { promotionId: promotion.id }
  });

  if (usageCount >= promotion.maxUses) {
    // Promotion épuisée
  }
}
```

##### 3. Limite par utilisateur
```typescript
if (userId && promotion.perUserLimit) {
  const userUsageCount = await prisma.appliedPromotion.count({
    where: {
      promotionId: promotion.id,
      userId
    }
  });

  if (userUsageCount >= promotion.perUserLimit) {
    // Utilisateur a atteint sa limite
  }
}
```

##### 4. Ciblage utilisateur
```typescript
if (promotion.targetType === 'SPECIFIC_USERS') {
  if (!promotion.targetUserIds.includes(userId)) {
    // Utilisateur non ciblé
  }
}

if (promotion.targetType === 'CRITERIA_BASED') {
  // Vérifier les critères (à implémenter selon les besoins)
}
```

#### Sélection de la Meilleure Promotion
```typescript
// Trouver toutes les promotions applicables
let bestDiscount = 0;
let appliedPromotion = null;

for (const promo of applicablePromotions) {
  // Vérifier validité (période, limites, ciblage)
  if (!isPromotionValid(promo, userId)) continue;

  // Calculer la réduction
  let discount = 0;
  if (promo.type === 'PERCENT' && promo.value) {
    discount = Math.floor((basePrice * promo.value) / 100);
  } else if (promo.type === 'FIXED' && promo.value) {
    discount = promo.value;
  } else if (promo.type === 'FREE') {
    discount = basePrice;
  }

  // Garder la meilleure réduction
  if (discount > bestDiscount) {
    bestDiscount = discount;
    appliedPromotion = promo;
  }
}

const finalPrice = Math.max(0, basePrice - bestDiscount);
```

---

### 4. Bundle (Offres Groupées)

#### Structure
```typescript
{
  id: string;
  name: string;
  description?: string;
  slug: string;             // URL-friendly (UNIQUE)

  // Prix
  amountCents: number;      // Prix du bundle
  originalAmountCents: number;  // Somme des prix unitaires (pour afficher économies)
  currency: string;         // Défaut: EUR

  // Disponibilité
  isActive: boolean;
  validFrom?: DateTime;
  validUntil?: DateTime;
  maxPurchases?: number;
  purchaseCount: number;

  // Affichage
  displayOrder?: number;
  imageUrl?: string;

  // Métadonnées
  createdAt: DateTime;
  updatedAt: DateTime;
  createdBy?: string;

  // Relations
  items: BundleItem[];
}
```

#### BundleItem
```typescript
{
  id: string;
  bundleId: string;
  type: 'CHAPTER' | 'VOLUME';
  chapterId?: string;
  volumeFrom?: number;
  volumeTo?: number;
  displayOrder: number;
}
```

#### Calcul du Prix Original (Économies)
```typescript
// Service: bundlesService.calculateOriginalPrice(items)

let totalPrice = 0;
const activeSchema = await priceSchemaService.getActiveSchema();

for (const item of items) {
  if (item.type === 'CHAPTER') {
    // Prix du chapitre entier
    const chapterPrices = await priceSchemaService.getChapterPrices(item.chapterId);
    const volumeCount = await prisma.volume.count({ where: { chapterId: item.chapterId } });

    // Volumes 1-7 : freeToRead
    const freeToReadVolumes = Math.min(volumeCount, 7);
    // Volumes 8+ : paywall
    const paywallVolumes = Math.max(0, volumeCount - 7);

    totalPrice += freeToReadVolumes * chapterPrices.priceFreeToRead;
    totalPrice += paywallVolumes * chapterPrices.pricePaywall;

  } else if (item.type === 'VOLUME') {
    // Prix de volumes spécifiques
    const chapterPrices = await priceSchemaService.getChapterPrices(item.chapterId);

    for (let vol = item.volumeFrom; vol <= item.volumeTo; vol++) {
      if (vol <= 7) {
        totalPrice += chapterPrices.priceFreeToRead;
      } else {
        totalPrice += chapterPrices.pricePaywall;
      }
    }
  }
}

return totalPrice;
```

#### Calcul de la Réduction
```typescript
const discount = Math.round(
  ((bundle.originalAmountCents - bundle.amountCents) / bundle.originalAmountCents) * 100
);

// Exemple: originalAmount = 1000, amount = 750
// discount = ((1000 - 750) / 1000) * 100 = 25%
```

#### Vérification de Disponibilité
```typescript
// Service: bundlesService.isBundleAvailable(bundleId)

// 1. Bundle actif
if (!bundle.isActive) return false;

const now = new Date();

// 2. Période de validité
if (bundle.validFrom && bundle.validFrom > now) return false;
if (bundle.validUntil && bundle.validUntil < now) return false;

// 3. Limite d'achats
if (bundle.maxPurchases && bundle.purchaseCount >= bundle.maxPurchases) return false;

return true;
```

---

## Logique de Tarification des Volumes

### Flux Complet

```typescript
// Service: pricingService.getVolumePrice({ chapterId, volumeNumber, userId })

// 1. Vérifier entitlement (accès complet via bundle/chapitre acheté)
const entitlement = await prisma.entitlement.findFirst({
  where: {
    userId,
    chapterId,
    volumeFrom: { lte: volumeNumber },
    volumeTo: { gte: volumeNumber }
  }
});

if (entitlement) {
  return { finalPrice: 0, hasAccess: true };
}

// 2. Récupérer le volume
const volume = await prisma.volume.findUnique({
  where: { chapterId_volumeNumber: { chapterId, volumeNumber } }
});

// 3. Déterminer le type de volume et le prix de base
let basePriceInCents = 0;
let volumeType = '';
let canWait = true;

const chapterPrices = await priceSchemaService.getChapterPrices(chapterId);

if (volume.isFree) {
  // Volume gratuit
  return { finalPrice: 0, canWait: false };
}

if (volume.isFinalPaywall) {
  // Volumes 9-10 (Paywall)
  basePriceInCents = chapterPrices.pricePaywall;
  volumeType = 'PAYWALL';
  canWait = false;

} else if (volume.volumeNumber > 10) {
  // Volumes 11+ (Épilogues)
  basePriceInCents = chapterPrices.priceEpilogue;
  volumeType = 'EPILOGUE';
  canWait = false;

} else {
  // Volumes 1-8 (Free-to-Read)
  basePriceInCents = chapterPrices.priceFreeToRead;
  volumeType = 'FREE_TO_READ';
  canWait = true;
}

// 4. Vérifier si wait déjà actif
const unlock = await prisma.unlock.findUnique({
  where: {
    userId_chapterId_volumeNumber: { userId, chapterId, volumeNumber }
  }
});

if (unlock && unlock.unlocksAt > new Date()) {
  canWait = false; // Déjà en attente
}

// 5. Appliquer les promotions
const pricesForVolume = await prisma.price.findMany({
  where: { scope: 'VOLUME', refId: volume.id },
  include: { promotions: { where: { isActive: true } } }
});

let finalPrice = basePriceInCents;
let appliedPromotion = null;
let bestDiscount = 0;

for (const priceRecord of pricesForVolume) {
  for (const promo of priceRecord.promotions) {
    // Vérifier validité (période, limites, ciblage)
    if (!isPromotionValid(promo, userId)) continue;

    // Calculer réduction
    const discount = calculateDiscount(promo, basePriceInCents);

    if (discount > bestDiscount) {
      bestDiscount = discount;
      appliedPromotion = promo;
    }
  }
}

if (bestDiscount > 0) {
  finalPrice = Math.max(0, basePriceInCents - bestDiscount);
}

// 6. Retourner les informations de prix
return {
  basePrice: basePriceInCents,
  finalPrice,
  hasAccess: false,
  canWait,
  waitDuration: Number(volume.waitDuration),
  volumeType,
  promotion: appliedPromotion ? {
    id: appliedPromotion.id,
    type: appliedPromotion.type,
    value: appliedPromotion.value,
    discount: bestDiscount
  } : null
};
```

---

## Matrice des Prix par Type de Volume

| Volume | Type | Prix Par Défaut | Peut Wait? | Override Possible? |
|--------|------|----------------|-----------|-------------------|
| 1 | FREE_TO_READ | €1.99 | Oui (mais vol. 1 toujours accessible) | Oui (via ChapterPriceOverride) |
| 2-8 | FREE_TO_READ | €1.99 | Oui | Oui |
| 9-10 | PAYWALL | €2.99 | Non | Oui |
| 11+ | EPILOGUE | €3.99 | Non | Oui |

---

## Enregistrement des Prix lors d'un Achat

Lorsqu'un utilisateur effectue un achat, enregistrer dans la table `Order` :

```typescript
{
  userId: string;
  type: OrderType;
  status: OrderStatus;
  refId: string;  // chapterId, volumeId, ou bundleId

  // IMPORTANT: Enregistrer les prix appliqués
  appliedPriceFreeToRead?: number;
  appliedPricePaywall?: number;
  appliedPriceEpilogue?: number;
  appliedPriceSchemaId?: string;  // Quel schéma était actif
  appliedPromotionId?: string;    // Quelle promo a été appliquée

  currency: string;
  amountTotal: number;  // Montant total payé
}
```

### Pourquoi Enregistrer les Prix?
- **Audit** : Historique complet des transactions
- **Analytics** : Analyser l'efficacité des promotions
- **Support** : Comprendre ce que l'utilisateur a payé
- **Conformité** : Preuve en cas de litige

---

## Exemples d'Utilisation

### Backend API

```typescript
// Endpoint: GET /api/reader/volume/:volumeId/price
export async function getVolumePrice(req, res) {
  const { volumeId } = req.params;
  const userId = req.user?.id;

  const volume = await prisma.volume.findUnique({ where: { id: volumeId } });

  const priceInfo = await pricingService.getVolumePrice({
    chapterId: volume.chapterId,
    volumeNumber: volume.volumeNumber,
    userId
  });

  res.json(priceInfo);
}
```

### Admin Panel

```typescript
// Afficher les prix d'un chapitre
const chapterPrices = await priceSchemaService.getChapterPrices(chapterId);

console.log(`Free-to-Read: €${chapterPrices.priceFreeToRead / 100}`);
console.log(`Paywall: €${chapterPrices.pricePaywall / 100}`);
console.log(`Epilogue: €${chapterPrices.priceEpilogue / 100}`);

if (chapterPrices.isOverride) {
  console.log('Prix surchargés pour ce chapitre');
}
```

### Web/Mobile

```typescript
// Afficher le prix d'un volume avec promotion
const { basePrice, finalPrice, promotion } = await fetch(
  `/api/reader/volume/${volumeId}/price`
).then(r => r.json());

if (promotion) {
  return (
    <div>
      <span className="line-through">€{(basePrice / 100).toFixed(2)}</span>
      <span className="text-green-600">€{(finalPrice / 100).toFixed(2)}</span>
      <span className="badge">-{promotion.value}%</span>
    </div>
  );
} else {
  return <span>€{(finalPrice / 100).toFixed(2)}</span>;
}
```

---

## Récapitulatif des Tables

### Hiérarchie de Tarification
1. **PriceSchema** → Prix par défaut globaux
2. **ChapterPriceOverride** → Surcharge pour un chapitre spécifique
3. **Promotion** → Réductions temporaires
4. **Bundle** → Offres groupées avec réduction

### Tables de Suivi
- **Order** → Enregistre les prix appliqués lors de l'achat
- **AppliedPromotion** → Suivi des utilisations de promotions
- **PriceHistory** → Historique des changements de prix

---

## Points Importants

1. **Toujours utiliser `priceSchemaService.getChapterPrices(chapterId)`** pour obtenir les prix effectifs
2. **Vérifier les promotions** à chaque calcul de prix (peuvent expirer)
3. **Enregistrer les prix appliqués** dans Order lors d'un achat
4. **UN SEUL schéma actif** à la fois
5. **Les promotions se cumulent** (meilleure réduction appliquée)
6. **Les bundles ont des prix fixes** (ne suivent pas les schémas)
7. **Volume 1 toujours accessible** (même si prix défini)

---

## Migration et Historique

Si vous modifiez les prix :
1. **Ne jamais modifier directement** un PriceSchema actif
2. **Créer un nouveau schéma** avec les nouveaux prix
3. **Désactiver l'ancien** schéma (`isActive = false`, `appliedTo = now`)
4. **Activer le nouveau** schéma
5. **L'historique est automatiquement enregistré** dans PriceHistory
