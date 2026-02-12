# Plan d'Implémentation - Reader Drawer & Accessibility V2

## Vue d'ensemble

Ce document détaille le plan d'implémentation pour les changements majeurs suivants :
1. Conversion du Reader (page → drawer/modal fullscreen)
2. Implémentation complète des règles d'accessibilité
3. Système canStartWait avec déclenchement à 65% de scroll
4. Scroll automatique en haut de page lors de navigation
5. Nouvelles interfaces utilisateur

---

## Phase 1 : Scroll to Top (FACILE - 15 min)

### Changements
- Ajouter un composant `ScrollToTop` dans React Router
- S'exécute automatiquement lors de chaque changement de route

### Fichiers à modifier
- `apps/web/src/App.tsx`
- Créer `apps/web/src/components/common/ScrollToTop.tsx`

### Code
```tsx
// apps/web/src/components/common/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// apps/web/src/App.tsx
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />  {/* Ajouter ici */}
      <Routes>
        ...
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Phase 2 : Refonte Backend - Accessibility V2 (COMPLEXE - 3-4h)

### 2.1 Database Changes

#### Migration Prisma
Ajouter le champ `canStartWaitFrom` dans VolumeRead :

```prisma
model VolumeRead {
  id            String   @id @default(uuid())
  userId        String
  chapterId     String
  volumeNumber  Int
  firstOpenedAt DateTime @default(now())
  completedAt   DateTime?
  canStartWaitFrom DateTime? // NOUVEAU
  user          User     @relation(...)
  chapter       Chapter  @relation(...)

  @@unique([userId, chapterId, volumeNumber])
  @@index([userId, chapterId])
  @@map("volume_reads")
}
```

Commandes :
```bash
cd apps/backend
npx prisma migrate dev --name add-can-start-wait-from
npx prisma generate
```

### 2.2 Catalog Service - Nouvelle Logique d'Accessibilité

**Fichier**: `apps/backend/src/modules/reader/catalog/catalog.service.ts`

#### Modifications de getChapter()

Remplacer toute la section "Mark each volume with detailed unlock status" :

```typescript
// NOUVELLE LOGIQUE selon VOLUME-ACCESSIBILITY-RULES.md

const volumesWithAccessibility = chapter.volumes.map(volume => {
  // Règle 0 : Unpublished volumes n'existent pas
  const isPublished = volume.status === VolumeStatus.PUBLISHED &&
    (volume.scheduledFor === null || volume.scheduledFor <= now);

  if (!isPublished) {
    return null; // Ne pas retourner les volumes non publiés
  }

  // Par défaut
  let isAccessible = false;
  let blockageType: string | null = null;
  let blockageInfo: any = null;

  // Hiérarchie de déblocage :

  // 1. Bundle ou Chapitre acheté
  const hasFullAccess = entitlement &&
    entitlement.volumeFrom <= volume.volumeNumber &&
    entitlement.volumeTo >= volume.volumeNumber &&
    entitlement.source !== 'SUBSCRIPTION'; // SUBSCRIPTION = free wait-to-read

  if (hasFullAccess) {
    isAccessible = true;
  }
  // 2. isFree
  else if (volume.isFree) {
    isAccessible = true;
  }
  // 3. Volumes 1-8 : Wait-to-Read
  else if (volume.volumeNumber <= 8) {
    // Vérifier achat freeToRead
    const hasPaidFreeToRead = await checkPaidFreeToRead(userId, volume.id);
    if (hasPaidFreeToRead) {
      isAccessible = true;
    } else {
      // Vérifier wait unlock
      const unlock = unlocks.find(u => u.volumeNumber === volume.volumeNumber);
      if (unlock && unlock.unlocksAt <= now) {
        isAccessible = true;
      } else {
        blockageType = 'WAIT_OR_PAY';
        blockageInfo = {
          waitRemaining: unlock ? Math.max(0, unlock.unlocksAt.getTime() - now.getTime()) : null,
          priceFreeToRead: await getPriceFreeToRead(chapterId)
        };
      }
    }
  }
  // 4. Volumes 9-10 : Paywall
  else if (volume.volumeNumber <= 10) {
    const hasPaidPaywall = await checkPaidPaywall(userId, chapterId);
    if (hasPaidPaywall) {
      isAccessible = true;
    } else {
      blockageType = 'PAYWALL';
      blockageInfo = {
        pricePaywall: await getPricePaywall(chapterId)
      };
    }
  }
  // 5. Volumes 11+ : Épilogues
  else {
    const hasPaidEpilogue = await checkPaidEpilogue(userId, chapterId);
    if (hasPaidEpilogue) {
      isAccessible = true;
    } else {
      blockageType = 'EPILOGUE';
      blockageInfo = {
        priceEpilogue: await getPriceEpilogue(chapterId)
      };
    }
  }

  // canStartWait logic (volumes 1-7 uniquement)
  let canStartWait = false;
  if (volume.volumeNumber >= 2 && volume.volumeNumber <= 8) {
    const previousVolumeRead = volumeReads.find(r => r.volumeNumber === volume.volumeNumber - 1);
    if (previousVolumeRead && previousVolumeRead.canStartWaitFrom) {
      canStartWait = true;
    }
  }

  return {
    ...volume,
    isAccessible,
    blockageType,
    blockageInfo,
    canStartWait
  };
}).filter(v => v !== null); // Retirer volumes non publiés
```

#### Nouvelles fonctions helpers

```typescript
// Vérifier achat freeToRead (volumes 1-8)
async function checkPaidFreeToRead(userId: string, volumeId: string): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      refId: volumeId,
      status: OrderStatus.PAID,
      appliedPriceFreeToRead: { gt: 0 }
    }
  });
  return !!order;
}

// Vérifier achat paywall (volumes 9-10)
async function checkPaidPaywall(userId: string, chapterId: string): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      refId: chapterId,
      status: OrderStatus.PAID,
      appliedPricePaywall: { gt: 0 }
    }
  });
  return !!order;
}

// Vérifier achat epilogue (volumes 11+)
async function checkPaidEpilogue(userId: string, chapterId: string): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      refId: chapterId,
      status: OrderStatus.PAID,
      appliedPriceEpilogue: { gt: 0 }
    }
  });
  return !!order;
}

// Récupérer prix freeToRead
async function getPriceFreeToRead(chapterId: string): Promise<number> {
  const prices = await priceSchemaService.getChapterPrices(chapterId);
  return prices.priceFreeToRead;
}

// Récupérer prix paywall
async function getPricePaywall(chapterId: string): Promise<number> {
  const prices = await priceSchemaService.getChapterPrices(chapterId);
  return prices.pricePaywall;
}

// Récupérer prix epilogue
async function getPriceEpilogue(chapterId: string): Promise<number> {
  const prices = await priceSchemaService.getChapterPrices(chapterId);
  return prices.priceEpilogue;
}
```

### 2.3 Reader Service - 65% Scroll Trigger

**Fichier**: `apps/backend/src/modules/reader/reader/reader.service.ts`

Ajouter nouvelle méthode :

```typescript
async markCanStartWait(
  userId: string,
  chapterId: string,
  volumeNumber: number
): Promise<void> {
  // Sécurité : Vérifier que l'utilisateur a bien lu le volume
  const volumeRead = await prisma.volumeRead.findUnique({
    where: {
      userId_chapterId_volumeNumber: {
        userId,
        chapterId,
        volumeNumber
      }
    }
  });

  if (!volumeRead) {
    throw new Error('VOLUME_NOT_READ');
  }

  // Sécurité : Vérifier timing (au moins 2 minutes de lecture)
  const timeSinceOpen = Date.now() - volumeRead.firstOpenedAt.getTime();
  const MIN_READ_TIME = 2 * 60 * 1000; // 2 minutes

  if (timeSinceOpen < MIN_READ_TIME) {
    throw new Error('READ_TOO_FAST');
  }

  // Sécurité : Volumes 1-7 uniquement
  if (volumeNumber < 1 || volumeNumber > 7) {
    throw new Error('INVALID_VOLUME_FOR_WAIT');
  }

  // Marquer canStartWaitFrom sur le volume SUIVANT
  const nextVolumeNumber = volumeNumber + 1;

  await prisma.volumeRead.upsert({
    where: {
      userId_chapterId_volumeNumber: {
        userId,
        chapterId,
        volumeNumber: nextVolumeNumber
      }
    },
    create: {
      userId,
      chapterId,
      volumeNumber: nextVolumeNumber,
      canStartWaitFrom: new Date()
    },
    update: {
      canStartWaitFrom: new Date()
    }
  });
}
```

#### Nouvelle route API

**Fichier**: `apps/backend/src/modules/reader/reader/reader.routes.ts`

```typescript
router.post('/mark-can-start-wait', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { chapterId, volumeNumber } = req.body;

    await readerService.markCanStartWait(userId, chapterId, volumeNumber);

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## Phase 3 : Frontend - Reader Drawer Component (COMPLEXE - 2-3h)

### 3.1 Créer le Composant ReaderDrawer

**Fichier**: `apps/web/src/components/ReaderDrawer.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import { useReaderStore } from '../stores/readerStore';
import { useThemeStore } from '../stores/themeStore';
import api from '../lib/api';

interface ReaderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  volumeId: string;
  chapterId: string;
  volumeNumber: number;
}

export default function ReaderDrawer({
  isOpen,
  onClose,
  volumeId,
  chapterId,
  volumeNumber
}: ReaderDrawerProps) {
  const {
    currentVolume,
    isLoading,
    error,
    settings,
    loadVolume,
    saveProgress,
    updateSettings
  } = useReaderStore();
  const { isDark, toggleTheme } = useThemeStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasTriggered65, setHasTriggered65] = useState(false);

  // Load volume when drawer opens
  useEffect(() => {
    if (isOpen && volumeId) {
      loadVolume(volumeId);
      setHasTriggered65(false);
    }
  }, [isOpen, volumeId, loadVolume]);

  // Scroll tracking + 65% trigger
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      if (!contentRef.current) return;

      const windowHeight = window.innerHeight;
      const documentHeight = contentRef.current.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollable = documentHeight - windowHeight;

      if (scrollable > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / scrollable) * 100));
        setScrollProgress(Math.round(progress));

        // Trigger at 65% (only for volumes 1-7)
        if (progress >= 65 && !hasTriggered65 && volumeNumber >= 1 && volumeNumber <= 7) {
          setHasTriggered65(true);
          triggerCanStartWait();
        }

        // Save progress
        if (currentVolume) {
          saveProgress(currentVolume.id, scrollTop);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, currentVolume, saveProgress, hasTriggered65, volumeNumber]);

  const triggerCanStartWait = async () => {
    try {
      await api.markCanStartWait({ chapterId, volumeNumber });
    } catch (err) {
      console.error('Failed to mark canStartWait:', err);
    }
  };

  // Empêcher scroll du body quand drawer ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-background-dark">
      {/* Header avec bouton fermeture et menu */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gold/20">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-primary hover:text-primary/80">
            <span className="material-symbols-outlined">arrow_back</span>
            Retour
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{scrollProgress}%</span>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      {isMenuOpen && (
        <div className="fixed right-4 top-16 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gold/20 p-6 w-80">
          {/* Font size, line height, font family, theme controls */}
          {/* ... (copier du Reader.tsx actuel) ... */}
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="pt-20 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
        ) : currentVolume ? (
          <article className="max-w-4xl mx-auto px-6">
            {/* Volume illustration */}
            {/* Volume content */}
            {/* End-of-volume UI (selon volumeNumber) */}
          </article>
        ) : null}
      </div>
    </div>
  );
}
```

### 3.2 Modifier Chapter.tsx

**Fichier**: `apps/web/src/pages/Chapter.tsx`

```tsx
import { useState } from 'react';
import ReaderDrawer from '../components/ReaderDrawer';

export default function Chapter() {
  const [readerOpen, setReaderOpen] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<{
    id: string;
    volumeNumber: number;
  } | null>(null);

  const handleOpenVolume = (volume: any) => {
    if (volume.isAccessible) {
      setSelectedVolume({
        id: volume.id,
        volumeNumber: volume.volumeNumber
      });
      setReaderOpen(true);
    }
  };

  return (
    <main>
      {/* ... contenu existant ... */}

      {/* Volumes list */}
      {currentChapter.volumes?.map(volume => (
        <div key={volume.id}>
          {volume.isAccessible ? (
            <button onClick={() => handleOpenVolume(volume)}>
              Lire le Volume {volume.volumeNumber}
            </button>
          ) : (
            <div>
              {/* Afficher blockageType et blockageInfo */}
              {volume.blockageType === 'WAIT_OR_PAY' && (
                <div>
                  <p>Attendre {formatTime(volume.blockageInfo.waitRemaining)}</p>
                  <p>ou payer {formatPrice(volume.blockageInfo.priceFreeToRead)}</p>
                </div>
              )}
              {/* ... autres blockage types ... */}
            </div>
          )}
        </div>
      ))}

      {/* Reader Drawer */}
      {selectedVolume && (
        <ReaderDrawer
          isOpen={readerOpen}
          onClose={() => {
            setReaderOpen(false);
            // Rafraîchir les données du chapitre
            fetchChapter(id);
          }}
          volumeId={selectedVolume.id}
          chapterId={id!}
          volumeNumber={selectedVolume.volumeNumber}
        />
      )}
    </main>
  );
}
```

### 3.3 Supprimer la Route Reader

**Fichier**: `apps/web/src/App.tsx`

Supprimer :
```tsx
<Route
  path="/reader/:volumeId"
  element={...}
/>
```

Optionnellement garder pour redirection :
```tsx
<Route
  path="/reader/:volumeId"
  element={<Navigate to="/catalogue" replace />}
/>
```

---

## Phase 4 : End-of-Volume UI (MOYEN - 1-2h)

### 4.1 Composants End-of-Volume

**Fichier**: `apps/web/src/components/EndOfVolumeUI.tsx`

```tsx
interface EndOfVolumeUIProps {
  volumeNumber: number;
  chapterId: string;
  nextVolume?: {
    isAccessible: boolean;
    blockageType?: string;
    blockageInfo?: any;
  };
  onClose: () => void;
}

export default function EndOfVolumeUI({
  volumeNumber,
  chapterId,
  nextVolume,
  onClose
}: EndOfVolumeUIProps) {
  // Volumes 1-7 : Wait or Pay
  if (volumeNumber <= 7 && nextVolume && !nextVolume.isAccessible) {
    if (nextVolume.blockageType === 'WAIT_OR_PAY') {
      return (
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-serif mb-4">Volume terminé !</h3>
          <p className="mb-6">Envie de découvrir la suite ?</p>
          <div className="flex gap-4 justify-center">
            <button className="btn-secondary">
              Attendre gratuitement
              <span className="text-sm">({formatTime(nextVolume.blockageInfo.waitRemaining)})</span>
            </button>
            <button className="btn-primary">
              Débloquer
              <span className="text-sm">({formatPrice(nextVolume.blockageInfo.priceFreeToRead)})</span>
            </button>
          </div>
        </div>
      );
    }
  }

  // Volume 8 : Paywall
  if (volumeNumber === 8 && nextVolume && nextVolume.blockageType === 'PAYWALL') {
    return (
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-300/50 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-serif mb-4">Volumes Premium</h3>
        <p className="mb-6">Accédez aux volumes 9 et 10</p>
        <button className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500">
          Débloquer {formatPrice(nextVolume.blockageInfo.pricePaywall)}
        </button>
      </div>
    );
  }

  // Volume 10 : Épilogues
  if (volumeNumber === 10 && nextVolume && nextVolume.blockageType === 'EPILOGUE') {
    return (
      <div className="bg-gradient-to-br from-gold/20 to-amber-500/20 border border-gold/50 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-serif mb-4">Épilogues Exclusifs</h3>
        <p className="mb-6">Découvrez les épilogues secrets</p>
        <button className="btn-primary bg-gradient-to-r from-gold to-amber-500">
          Débloquer {formatPrice(nextVolume.blockageInfo.priceEpilogue)}
        </button>
      </div>
    );
  }

  // Default : Retour au chapitre
  return (
    <div className="text-center p-8">
      <h3 className="text-2xl font-serif mb-4">Volume terminé !</h3>
      <button onClick={onClose} className="btn-primary">
        Retour au chapitre
      </button>
    </div>
  );
}
```

---

## Phase 5 : Tests & Validation

### Checklist de Test

#### Backend
- [ ] Migration Prisma appliquée
- [ ] `canStartWaitFrom` enregistré correctement
- [ ] API `/mark-can-start-wait` fonctionne
- [ ] Sécurité : timing minimum respecté
- [ ] Sécurité : volumes 1-7 uniquement
- [ ] Nouvelle logique d'accessibilité retourne les bons blockageType
- [ ] Prix récupérés via priceSchemaService
- [ ] Volumes non publiés non retournés

#### Frontend
- [ ] Scroll to top fonctionne
- [ ] ReaderDrawer s'ouvre en fullscreen
- [ ] Body scroll bloqué quand drawer ouvert
- [ ] 65% trigger envoie API request
- [ ] End-of-volume UI s'affiche correctement
- [ ] Fermeture drawer rafraîchit Chapter
- [ ] Route `/reader/:id` redirige vers catalogue
- [ ] Settings menu fonctionne dans drawer

#### UX
- [ ] Volumes 1-7 : Wait or Pay affiché
- [ ] Volume 8 : Paywall affiché
- [ ] Volume 10 : Épilogues affiché
- [ ] Volumes inaccessibles : bon message d'erreur
- [ ] Volumes isFree : accessibles immédiatement
- [ ] Transitions fluides

---

## Ordre d'Implémentation Recommandé

1. **Phase 1** : Scroll to top (15 min)
2. **Phase 2.1** : Migration database (30 min)
3. **Phase 2.2** : Catalog service refonte (2h)
4. **Phase 2.3** : Reader service 65% trigger (1h)
5. **Phase 3.1** : ReaderDrawer component (2h)
6. **Phase 3.2** : Chapter integration (30 min)
7. **Phase 3.3** : Supprimer route Reader (5 min)
8. **Phase 4** : End-of-volume UI (1-2h)
9. **Phase 5** : Tests complets (1h)

**Temps total estimé** : 8-10 heures

---

## Risques et Mitigations

### Risque 1 : Perte de données de progression
**Mitigation** : Conserver l'ancien système pendant 1 semaine en parallèle

### Risque 2 : Performance du drawer
**Mitigation** : Lazy loading du contenu, virtualization si nécessaire

### Risque 3 : Breaking changes pour utilisateurs actifs
**Mitigation** : Redirection automatique `/reader/:id` → `/chapters/:chapterId`

### Risque 4 : Problèmes de scroll sur mobile
**Mitigation** : Tests extensifs iOS/Android, position: fixed avec overflow

---

## Notes Importantes

- **Ne pas oublier** : Refresh du chapitre après fermeture du drawer
- **Sécurité** : Toutes les vérifications côté backend
- **UX** : Animations fluides pour ouverture/fermeture drawer
- **Performance** : Précharger le volume suivant si accessible
- **Analytics** : Tracker les 65% triggers pour optimiser

---

## Prochaines Étapes (Post-Implementation)

1. Système de paiement Stripe pour freeToRead/paywall/epilogue
2. Notifications push quand wait unlock termine
3. Prévisualisation du volume suivant (premiers paragraphes)
4. Partage de progression sur réseaux sociaux
5. Mode lecture hors-ligne (PWA)
