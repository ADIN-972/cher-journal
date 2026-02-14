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
```

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
