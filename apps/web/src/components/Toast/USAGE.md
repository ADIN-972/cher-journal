# Toast Notification System - Usage Guide

## Overview

The Toast system provides elegant, persistent notifications with optional action buttons. Toasts remain visible until the user manually closes them or clicks an action button.

## Basic Usage

### Import the hook
```typescript
import { useToast } from '../../hooks/useToast';
```

### Simple notifications
```typescript
const toast = useToast();

// Success notification (no auto-dismiss)
toast.success('Succès', 'Opération réussie');

// Error notification
toast.error('Erreur', 'Une erreur est survenue');

// Warning notification
toast.warning('Avertissement', 'Votre abonnement expire bientôt');

// Info notification
toast.info('Information', 'Nouvelle mise à jour disponible');

// Promo notification
toast.promo('Offre spéciale', 'Bundle disponible à prix réduit');
```

### With auto-dismiss (optional)
```typescript
// Auto-dismiss after 3 seconds
toast.success('Copié!', undefined, 3000);

// Auto-dismiss after 5 seconds
toast.info('Notification temporaire', 'Ce message disparaîtra dans 5 secondes', 5000);
```

**Auto-dismiss Feature**:
- Pass a `duration` parameter (in milliseconds) to enable auto-dismiss
- Toast displays a **visual progress bar** showing remaining time
- Progress bar color matches the notification type:
  - **Success**: Gold (#d4af37)
  - **Error**: Pink (#e91e63)
  - **Promo**: Lavender (#b39ddb)
  - **Warning**: Amber (#ffc107)
  - **Info**: Gray
- User can still manually close the toast with the X button
- Progress bar animates smoothly from 100% → 0% over the duration

## Using Helper Functions

### Success Toast - Chapter Unlocked
```typescript
import { createSuccessToast } from '../../lib/toastHelper';

const toast = useToast();

toast.addToast(createSuccessToast(
  'Le secret est désormais vôtre',
  'Votre chapitre a été débloqué avec succès. Bonne lecture.',
  {
    label: 'Lire maintenant',
    onClick: () => navigate(`/chapters/${chapterId}`)
  }
));
```

### Error Toast - Payment Failed
```typescript
import { createErrorToast } from '../../lib/toastHelper';

toast.addToast(createErrorToast(
  'Un léger contretemps...',
  'Votre paiement n\'a pas pu aboutir. Veuillez vérifier vos informations.',
  () => retryPayment(), // Retry button action
  () => {} // Later button action (optional)
));
```

### Promo Toast - Special Offer
```typescript
import { createPromoToast } from '../../lib/toastHelper';

toast.addToast(createPromoToast(
  'Une invitation exclusive',
  'Un nouveau bundle "Nuits de Soie" est disponible à prix doux.',
  {
    label: 'Découvrir l\'offre',
    onClick: () => navigate('/bundles')
  }
));
```

### Warning Toast - Subscription Expiring
```typescript
import { createWarningToast } from '../../lib/toastHelper';

toast.addToast(createWarningToast(
  'Le sablier s\'écoule...',
  'Votre Pass Privilège expire dans 2 heures.',
  {
    label: 'Renouveler',
    onClick: () => handleRenewal()
  }
));
```

### Info Toast - Update Available
```typescript
import { createInfoToast } from '../../lib/toastHelper';

toast.addToast(createInfoToast(
  'Un nouveau murmure...',
  'L\'auteur Clara Valmont vient de publier une mise à jour.',
  {
    label: 'Consulter',
    onClick: () => navigate('/updates')
  }
));
```

### Recommendation Toast
```typescript
import { createRecommendationToast } from '../../lib/toastHelper';

toast.addToast(createRecommendationToast(
  'Le Boudoir vous connaît...',
  'Basé sur vos lectures, nous pensons que "Éclats d\'Émotion" saura vous séduire.',
  {
    label: 'Découvrir',
    onClick: () => navigate('/chapter/eclats-emotion')
  }
));
```

### Achievement Toast
```typescript
import { createAchievementToast } from '../../lib/toastHelper';

toast.addToast(createAchievementToast(
  'Conquérant des Sens',
  'Félicitations! Vous avez débloqué votre 10ème conte.',
  {
    label: 'Réclamer',
    onClick: () => handleClaimBadge()
  }
));
```

## Advanced Usage

### Navigation Toast
```typescript
import { createNavigationToast } from '../../lib/toastHelper';

toast.addToast(createNavigationToast(
  'success',
  'Succès!',
  'Votre profil a été mis à jour.',
  '/profile',
  'Voir mon profil'
));
```

### Page Refresh Toast
```typescript
import { createRefreshToast } from '../../lib/toastHelper';

toast.addToast(createRefreshToast(
  'info',
  'Mise à jour disponible',
  'Une nouvelle version de l\'application est disponible.',
  true, // showRefreshButton
  'Rafraîchir la page'
));
```

### Manual Toast with Full Control
```typescript
toast.addToast({
  type: 'success',
  title: 'Custom Title',
  message: 'Custom message with full control',
  actions: [
    {
      label: 'Primary Action',
      onClick: () => console.log('Primary clicked'),
      variant: 'primary'
    },
    {
      label: 'Secondary Action',
      onClick: () => console.log('Secondary clicked')
    }
  ],
  duration: 5000 // Optional auto-dismiss
});
```

## Toast Types & Colors

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| success | Gold (#d4af37) | Pen | Purchase confirmed, Chapter unlocked |
| error | Pink (#e91e63) | Heart | Payment failed, Validation error |
| promo | Lavender (#b39ddb) | Gift | Special offer, Limited bundle |
| warning | Amber (#ffc107) | Clock | Subscription expiring, Urgent action |
| info | Gray | Envelope | Update notification, General info |

## Button Styling

- **Primary buttons**: Solid color matching notification type, white text
- **Secondary buttons**: Gray text ("Plus tard")
- **Outlined buttons** (Promo): Border with hover fill effect
- **Text buttons** (Info): Underlined with hover effect

## Progress Bar for Auto-Dismiss Toasts

When a toast has a `duration` (auto-dismiss enabled), a **visual progress bar** appears at the bottom of the toast:

```typescript
// Auto-dismiss with progress bar (5 seconds)
toast.success('Copié!', 'Lien copié dans le presse-papiers', 5000);
// → Shows gold progress bar, counts down to 0%

toast.info('Mise à jour', 'Une nouvelle version est disponible', 3000);
// → Shows gray progress bar, counts down to 0%
```

**Progress Bar Features**:
- ✅ Animates smoothly from **100% → 0%** over the duration
- ✅ Color-coded by toast type:
  - Gold for success
  - Pink for errors
  - Lavender for promotions
  - Amber for warnings
  - Gray for info
- ✅ Gives visual feedback on remaining time
- ✅ User can still manually close (X button) before it expires
- ✅ Only appears on toasts with a duration

**Use Cases for Progress Bars**:
- Temporary confirmations ("Copié!")
- Temporary status updates
- Non-critical notifications that should auto-dismiss
- Feedback that doesn't require user action

**Note**: Toasts WITH action buttons do NOT show progress bars, as they expect user interaction.

## Closing Toasts

Toasts are closed by:
1. **X button** (top-right) - Always available
2. **Action button click** - Automatically closes after action
3. **Manual removal** via API:
   ```typescript
   const id = toast.addToast(...);
   toast.removeToast(id);
   ```
4. **Clear all**:
   ```typescript
   toast.clearAll();
   ```

## Best Practices

1. **Use helper functions** for consistent styling and behavior
2. **Persistent by default** - No auto-dismiss unless needed
3. **Action buttons required** for toasts needing user interaction
4. **Clear messaging** - Title should be action/result, message provides context
5. **One button per action** - Keep it simple
6. **French titles** - Use the eloquent, intimate tone of Cher Journal

## Position

Toasts appear in the **top-right corner** of the screen and stack vertically. They slide in with a smooth animation and have a hover effect that slides them slightly left.

## Accessibility

- All buttons have proper `type="button"` attributes
- Close button has `aria-label="Close notification"`
- SVG icons are decorative (correct `fill="none" stroke="currentColor"`)
- High contrast text on light backgrounds
