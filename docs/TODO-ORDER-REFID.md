# 🔧 TODO: Ajouter le champ refId au modèle Order

## ✅ Status: Core Implementation Completed

**Date d'implémentation:** 2026-01-21

L'implémentation du champ `refId` est maintenant terminée et fonctionnelle:
- ✅ Schéma Prisma modifié avec indexes pour les performances
- ✅ Migration appliquée (20260121011940_add_order_refid)
- ✅ Service Stripe mis à jour pour inclure refId lors de la création de commandes
- ✅ Analytics dashboard réactivées (top chapters et top volumes)
- ⏳ Tests restants à effectuer (voir Phase 4 ci-dessous)

## 📋 Problème Original

Le modèle `Order` ne contient actuellement pas de champ pour référencer le contenu acheté (chapitre ou volume). Cela empêche l'implémentation des analytics "Top Chapitres" et "Top Volumes" dans le dashboard.

### Erreur Prisma

```
Invalid `prisma.order.groupBy()` invocation:
Unknown argument `refId`. Did you mean `userId`?
```

## 🎯 Solution Proposée

### 1. Modifier le Schéma Prisma

Ajouter le champ `refId` au modèle Order:

```prisma
model Order {
  id                      String      @id @default(uuid())
  userId                  String
  type                    OrderType
  status                  OrderStatus @default(PENDING)

  // NEW: Reference to purchased content
  refId                   String?     // Chapter ID or Volume ID depending on type

  provider                String?
  providerSessionId       String?
  providerPaymentIntentId String?
  currency                String?
  amountTotal             Int?
  appliedPriceFreeToRead  Int?
  appliedPricePaywall     Int?
  appliedPriceEpilogue    Int?
  appliedPriceSchemaId    String?
  appliedPromotionId      String?
  createdAt               DateTime    @default(now())
  user                    User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  refunds                 Refund[]

  @@index([userId])
  @@index([refId])        // NEW: Index for analytics queries
  @@index([type, refId])  // NEW: Composite index for filtered queries
  @@map("orders")
}
```

### 2. Créer la Migration

```bash
cd apps/backend
npx prisma migrate dev --name add_order_refid
```

### 3. Mettre à Jour le Code Existant

#### A. Service Stripe (stripe.service.ts)

Lors de la création d'une commande, ajouter le `refId`:

```typescript
// Dans handlePaymentSuccess ou createOrder
const order = await prisma.order.create({
  data: {
    userId: user.id,
    type: orderType, // CHAPTER, VOLUME, PREORDER, etc.
    refId: contentId, // ID du chapitre ou volume acheté
    status: 'PAID',
    // ... autres champs
  }
});
```

#### B. Dashboard Service (dashboard.service.ts)

Décommenter et activer les requêtes analytics:

```typescript
// Top 5 most purchased chapters
const topChapters = await prisma.order.groupBy({
  by: ['refId'],
  where: {
    status: OrderStatus.PAID,
    type: 'CHAPTER',
    refId: { not: null },
  },
  _count: true,
  _sum: { amountTotal: true },
  orderBy: { _count: { refId: 'desc' } },
  take: 5,
});

// Enrichir avec les détails des chapitres
const topChaptersWithDetails = await Promise.all(
  topChapters.map(async (item) => {
    const chapter = await prisma.chapter.findUnique({
      where: { id: item.refId! },
      select: { id: true, title: true },
    });
    return {
      refId: item.refId,
      count: item._count,
      revenue: item._sum.amountTotal || 0,
      chapter,
    };
  })
);
```

#### C. Tests de Migration de Données

Si des commandes existent déjà, il faudra peut-être migrer les données:

```sql
-- Exemple: Si les informations sont stockées ailleurs (metadata, logs, etc.)
-- UPDATE orders SET refId = ... WHERE type = 'CHAPTER' AND refId IS NULL;
```

## 📊 Impact

### Fonctionnalités Affectées

1. **Dashboard KPIs** ✅ Fixé temporairement
   - Top chapitres les plus vendus (actuellement vide)
   - Top volumes les plus vendus (actuellement vide)

2. **Analytics Avancées** ⏳ À implémenter
   - Revenus par chapitre
   - Revenus par volume
   - Graphiques de ventes par contenu
   - Analyses de popularité

3. **Rapports Exports** ⏳ À améliorer
   - Export CSV des commandes (actuellement pas de lien direct au contenu)
   - Rapports financiers par contenu

### Fichiers Concernés

#### Backend
- `apps/backend/prisma/schema.prisma` - Modèle Order
- `apps/backend/src/modules/admin/dashboard/dashboard.service.ts` - Analytics
- `apps/backend/src/modules/stripe/stripe.service.ts` - Création commandes
- `apps/backend/src/modules/admin/orders/orders.service.ts` - Gestion commandes

#### Frontend
- `apps/admin/src/pages/Dashboard.tsx` - Affichage KPIs
- `apps/admin/src/components/PurchaseDistributionChart.tsx` - Graphiques
- `apps/admin/src/pages/Orders.tsx` - Liste des commandes

## 🚀 Plan d'Implémentation

### Phase 1: Préparation ✅
- [x] Analyser les commandes existantes pour comprendre comment le contenu est actuellement tracké
- [x] Vérifier si des métadonnées Stripe contiennent ces informations
- [x] Créer un plan de migration de données si nécessaire

### Phase 2: Implémentation ✅
- [x] Modifier le schéma Prisma (ajout du champ refId avec indexes)
- [x] Créer et appliquer la migration (20260121011940_add_order_refid)
- [x] Mettre à jour stripe.service.ts pour inclure refId à la création
- [x] Migration des données existantes (NULL pour anciennes commandes - acceptable)

### Phase 3: Analytics ✅
- [x] Réactiver les requêtes dans dashboard.service.ts
- [x] Implémenter top chapters analytics avec enrichissement des détails
- [x] Implémenter top volumes analytics avec enrichissement des détails
- [ ] Créer de nouveaux endpoints analytics si nécessaire (optionnel)
- [ ] Ajouter des graphiques dans le frontend (optionnel)

### Phase 4: Tests
- [ ] Tester la création de nouvelles commandes avec refId
- [ ] Vérifier que les analytics fonctionnent dans le dashboard
- [ ] Valider les exports CSV avec refId
- [ ] Tests de performance sur les requêtes groupBy

## 🔍 Considérations Alternatives

### Option 1: Utiliser une table de liaison
Au lieu d'un champ `refId`, créer une table `OrderItem`:

```prisma
model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  type      String   // CHAPTER, VOLUME, etc.
  refId     String   // ID du contenu
  quantity  Int      @default(1)
  price     Int
  order     Order    @relation(fields: [orderId], references: [id])

  @@index([orderId])
  @@index([refId])
}
```

**Avantages:**
- Support de paniers multi-items
- Historique détaillé par item
- Plus flexible pour l'évolution

**Inconvénients:**
- Plus complexe
- Nécessite plus de requêtes
- Migration plus lourde

### Option 2: Garder le refId simple
Utiliser un seul champ `refId` comme proposé initialement.

**Avantages:**
- Simple et direct
- Facile à implémenter
- Performances optimales

**Inconvénients:**
- Un seul item par commande
- Pas de support de bundles multi-items (mais bundles auront leur propre type)

**Recommandation:** Option 2 pour commencer, migrer vers Option 1 si nécessaire plus tard.

## 📝 Notes

- Cette modification est **non-bloquante** pour la production actuelle
- Le dashboard fonctionne avec des tableaux vides en attendant
- Priorité: **PHASE 2** (Important mais pas urgent)
- Estimation: **2-4 heures** de développement + tests

## 🔗 Références

- Issue: Dashboard KPIs - Top content analytics
- Fix temporaire: Commit `6c7d4f9`
- Documentation: `apps/backend/src/modules/admin/dashboard/dashboard.service.ts:128-155`
- Modèle actuel: `apps/backend/prisma/schema.prisma:248-269`

---

**Créé:** 2026-01-19
**Dernière mise à jour:** 2026-01-21
**Priorité:** PHASE 2 - Important
**Status:** ✅ Core implementation completed (tests pending)
