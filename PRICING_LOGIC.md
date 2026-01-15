# Logique de Prix et Temporisation

## Système de Prix

### 3 Types de Prix

1. **priceFreeToRead** (Prix Free-to-Read)
   - S'applique aux volumes gratuits avec timer
   - Permet de débloquer immédiatement le volume sans attendre
   - Si l'utilisateur ne paie pas, il peut attendre la durée définie (`waitDuration`)

2. **pricePaywall** (Prix Paywall)
   - S'applique aux derniers volumes d'un chapitre (volumes paywall final)
   - Ces volumes ne peuvent PAS être débloqués gratuitement
   - Le champ `isFinalPaywall` doit être `true` pour forcer ce comportement

3. **priceEpilogue** (Prix Épilogue)
   - S'applique aux volumes dont le numéro est supérieur à 10 (épilogues)
   - **Si `priceEpilogue = 0`** : Le volume est soumis à la durée d'attente uniquement (gratuit avec timer)
   - **Si `priceEpilogue > 0`** : L'utilisateur peut payer pour débloquer immédiatement ou attendre

## Temporisation (Wait-Until-Free)

### Date de Publication

#### Au niveau du Chapter
- Champ `publishedAt` sur le modèle `Chapter`
- Si définie, TOUS les volumes de ce chapitre ne peuvent pas démarrer leur décompte avant cette date
- Permet de programmer la sortie d'un chapitre entier

#### Au niveau du Volume
- Champ `publishedAt` sur le modèle `Volume`
- Si définie, ce volume spécifique ne peut pas démarrer son décompte avant cette date
- La date de publication du volume est prioritaire sur celle du chapitre

### Règles de Décompte

1. **Vérification de la date de publication** :
   ```typescript
   const now = new Date();
   const chapterPublished = !chapter.publishedAt || chapter.publishedAt <= now;
   const volumePublished = !volume.publishedAt || volume.publishedAt <= now;
   
   if (!chapterPublished || !volumePublished) {
     // Le décompte ne peut pas démarrer
     return { locked: true, reason: 'NOT_PUBLISHED_YET' };
   }
   ```

2. **Démarrage du timer** :
   - Le timer démarre UNIQUEMENT quand l'utilisateur ouvre le volume pour la première fois
   - Création d'un enregistrement `Unlock` avec :
     - `triggeredBy: WAIT`
     - `unlocksAt: now + volume.waitDuration`

3. **Volumes paywall (isFinalPaywall = true)** :
   - Le timer ne démarre jamais
   - L'utilisateur DOIT payer `pricePaywall` pour y accéder

## Logique de Détermination du Prix

```typescript
function getVolumePrice(volume: Volume): number {
  // Volumes paywall obligatoires
  if (volume.isFinalPaywall) {
    return volume.pricePaywall;
  }
  
  // Épilogues (volume > 10)
  if (volume.volumeNumber > 10) {
    return volume.priceEpilogue;
  }
  
  // Volumes standard free-to-read
  return volume.priceFreeToRead;
}

function canWaitToUnlock(volume: Volume): boolean {
  // Paywall final : pas d'attente possible
  if (volume.isFinalPaywall) {
    return false;
  }
  
  // Épilogues payants : pas d'attente possible
  if (volume.volumeNumber > 10 && volume.priceEpilogue > 0) {
    return false;
  }
  
  // Tous les autres cas : attente possible
  return true;
}
```

## Exemples de Configuration

### Volume Free-to-Read Standard
```json
{
  "volumeNumber": 5,
  "priceFreeToRead": 99,
  "pricePaywall": 0,
  "priceEpilogue": 0,
  "waitDuration": 86400000,
  "isFinalPaywall": false,
  "publishedAt": "2026-01-15T10:00:00Z"
}
```
→ L'utilisateur peut payer 0.99€ OU attendre 24h après le 15/01/2026 10:00

### Volume Paywall Final
```json
{
  "volumeNumber": 10,
  "priceFreeToRead": 0,
  "pricePaywall": 299,
  "priceEpilogue": 0,
  "waitDuration": 0,
  "isFinalPaywall": true,
  "publishedAt": "2026-02-01T00:00:00Z"
}
```
→ L'utilisateur DOIT payer 2.99€, pas d'attente possible, disponible le 01/02/2026

### Épilogue Gratuit avec Attente
```json
{
  "volumeNumber": 11,
  "priceFreeToRead": 0,
  "pricePaywall": 0,
  "priceEpilogue": 0,
  "waitDuration": 172800000,
  "isFinalPaywall": false,
  "publishedAt": null
}
```
→ Épilogue gratuit avec attente de 48h (priceEpilogue = 0)

### Épilogue Payant
```json
{
  "volumeNumber": 12,
  "priceFreeToRead": 0,
  "pricePaywall": 0,
  "priceEpilogue": 149,
  "waitDuration": 0,
  "isFinalPaywall": false,
  "publishedAt": null
}
```
→ Épilogue payant à 1.49€, pas d'attente si prix > 0

## Implémentation Backend

### À Implémenter dans le Reader Service

```typescript
async checkVolumeAccess(userId: string, volumeId: string) {
  const volume = await prisma.volume.findUnique({
    where: { id: volumeId },
    include: { chapter: true },
  });

  const now = new Date();

  // 1. Vérifier les dates de publication
  if (volume.chapter.publishedAt && volume.chapter.publishedAt > now) {
    return { access: false, reason: 'CHAPTER_NOT_PUBLISHED' };
  }

  if (volume.publishedAt && volume.publishedAt > now) {
    return { access: false, reason: 'VOLUME_NOT_PUBLISHED' };
  }

  // 2. Vérifier l'entitlement
  const entitlement = await prisma.entitlement.findFirst({
    where: {
      userId,
      chapterId: volume.chapterId,
      volumeFrom: { lte: volume.volumeNumber },
      volumeTo: { gte: volume.volumeNumber },
    },
  });

  if (entitlement) {
    return { access: true, reason: 'PURCHASED' };
  }

  // 3. Vérifier unlock existant
  const unlock = await prisma.unlock.findUnique({
    where: {
      userId_chapterId_volumeNumber: {
        userId,
        chapterId: volume.chapterId,
        volumeNumber: volume.volumeNumber,
      },
    },
  });

  if (unlock && unlock.unlocksAt <= now) {
    return { access: true, reason: 'WAIT_COMPLETED' };
  }

  if (unlock && unlock.unlocksAt > now) {
    return { 
      access: false, 
      reason: 'WAITING', 
      unlocksAt: unlock.unlocksAt 
    };
  }

  // 4. Déterminer les options disponibles
  const price = this.getVolumePrice(volume);
  const canWait = this.canWaitToUnlock(volume);

  return {
    access: false,
    reason: 'LOCKED',
    price,
    canWait,
    waitDuration: volume.waitDuration,
  };
}
```

## Notes de Migration

Les anciennes colonnes `priceBase` et `priceAll` ont été remplacées par :
- `priceFreeToRead`
- `pricePaywall`
- `priceEpilogue`

Migration effectuée via : `20260111000139_refactor_pricing_and_add_published_dates`
