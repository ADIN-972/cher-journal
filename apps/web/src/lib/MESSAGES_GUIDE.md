# Système Centralisé de Gestion des Messages

## Vue d'ensemble

Ce système permet de gérer tous les messages de l'application (erreurs, succès, infos, avertissements, promotions) de manière centralisée et cohérente.

Chaque message dispose d'un **titre poétique et élégant** qui correspond à l'esthétique sensuelle du Cher Journal, associé à une **description explicative claire**.

## Structure

- **`messages.ts`** - Contient tous les codes de messages (50+) et leurs titres poétiques + descriptions
- **`toastHelper.ts`** - Contient des fonctions utilitaires pour afficher les messages via le système de toasts
- **`MESSAGES_GUIDE.md`** - Ce guide complet

## Utilisation

### 1. Afficher une erreur

```typescript
import { useToast } from "../hooks/useToast";
import { showErrorToast } from "../lib/toastHelper";

export function MyComponent() {
  const toast = useToast();

  try {
    await fetchData();
  } catch (error) {
    // Option 1: Passer le code d'erreur connu
    showErrorToast(toast, 'CHAPTER_NOT_FOUND');

    // Option 2: Passer l'objet d'erreur (le code sera extrait automatiquement)
    showErrorToast(toast, error);

    // Option 3: Passer un message d'erreur (sera traduit s'il est connu)
    showErrorToast(toast, 'Chapitre introuvable');
  }
}
```

### 2. Afficher un succès

```typescript
import { showSuccessToast } from "../lib/toastHelper";

showSuccessToast(toast, 'PURCHASE_SUCCESSFUL');
showSuccessToast(toast, 'LOGIN_SUCCESSFUL');
```

### 3. Afficher une info

```typescript
import { showInfoToast } from "../lib/toastHelper";

showInfoToast(toast, 'WAIT_COMPLETED');
showInfoToast(toast, 'NO_RESULTS');
```

### 4. Afficher un avertissement

```typescript
import { showWarningToast } from "../lib/toastHelper";

showWarningToast(toast, 'LIMITED_TIME_OFFER');
showWarningToast(toast, 'UNSAVED_CHANGES');
```

### 5. Afficher une promo

```typescript
import { showPromoToast } from "../lib/toastHelper";

showPromoToast(toast, 'EXCLUSIVE_BUNDLE');
showPromoToast(toast, 'PERSONALIZED_RECOMMENDATION');
```

## Exemples de Titres Poétiques

Le système utilise des titres élégants et sensibles qui correspondent à l'esthétique du Cher Journal:

### 🎭 Erreurs
- **"Un léger contretemps..."** - Erreurs génériques, chargement impossible
- **"Une porte fermée..."** - Authentification requise
- **"Le rideau s'est fermé..."** - Session expirée
- **"Patience..."** - Attente, timers à venir
- **"Une invitation perdue..."** - Promotion introuvable

### ✨ Succès
- **"Le secret est désormais vôtre"** - Achat, déverrouillage réussi
- **"L'attente commence..."** - Timer lancé
- **"Votre plume a trouvé écho"** - Avis publié, validation
- **"Bienvenue dans le boudoir..."** - Connexion réussie
- **"Conquérant des Sens"** - Succès, achievements

### ℹ️ Info
- **"Un instant..."** - Chargement en cours
- **"Le moment est venu..."** - Timer terminé
- **"Un nouveau murmure..."** - Nouvelle publication, update

### ⚠️ Avertissements
- **"Le sablier s'écoule..."** - Offre limitée, expiration prochaine
- **"Êtes-vous certaine?"** - Confirmation d'action destructive
- **"Vos mots s'échappent..."** - Modifications non enregistrées

### 🎁 Promotions
- **"Une invitation exclusive"** - Offre spéciale, bundle
- **"Le Boudoir vous connaît..."** - Recommandation personnalisée
- **"Une saison de sensualité"** - Promotion saisonnière

## Codes d'erreur disponibles

### Erreurs de contenu
- `CHAPTER_NOT_FOUND` - Chapitre introuvable
- `VOLUME_NOT_FOUND` - Volume introuvable
- `VOLUME_NUMBER_REQUIRED` - Numéro de volume manquant
- `VOLUME_IS_FREE` - Volume gratuit

### Erreurs d'achat/paiement
- `USER_ALREADY_HAS_ACCESS` - Accès déjà obtenu
- `INVALID_AMOUNT` - Montant invalide
- `PAYMENT_FAILED` - Paiement échoué
- `STRIPE_ERROR` - Erreur de paiement

### Erreurs d'authentification
- `UNAUTHORIZED` - Non autorisé
- `SESSION_EXPIRED` - Session expirée
- `LOGIN_FAILED` - Identifiants invalides
- `EMAIL_ALREADY_EXISTS` - Email déjà utilisé
- `WEAK_PASSWORD` - Mot de passe faible

### Erreurs de Wait-to-Read
- `WAIT_MAX_TIMERS_REACHED` - Limite de timers atteinte
- `WAIT_ALREADY_ACTIVE` - Timer déjà en cours
- `WAIT_NOT_FOUND` - Timer introuvable

### Erreurs d'avis
- `REVIEW_NOT_FOUND` - Avis introuvable
- `CANNOT_REVIEW_VOLUME` - Impossible de laisser un avis

### Erreurs de promotions
- `PROMOTION_NOT_FOUND` - Promotion introuvable
- `PROMOTION_EXPIRED` - Promotion expirée
- `PROMOTION_MAX_USES_REACHED` - Limite de promotion atteinte

### Erreurs génériques
- `LOAD_ERROR` - Impossible de charger
- `NETWORK_ERROR` - Erreur de connexion
- `UNKNOWN_ERROR` - Erreur inconnue

## Codes de succès disponibles

- `PURCHASE_SUCCESSFUL` - "Le secret est désormais vôtre" - Achat réussi
- `VOLUME_UNLOCKED` - "Le secret est désormais vôtre" - Volume débloqué
- `CHAPTER_UNLOCKED` - "Le secret est désormais vôtre" - Chapitre débloqué
- `WAIT_STARTED` - "L'attente commence..." - Timer lancé
- `REVIEW_PUBLISHED` - "Votre plume a trouvé écho" - Avis publié
- `REVIEW_UPDATED` - "Votre avis a été retouché" - Avis mis à jour
- `REVIEW_DELETED` - "Vos paroles se sont effacées" - Avis supprimé
- `PROFILE_UPDATED` - "Vous avez repris la plume" - Profil mis à jour
- `PASSWORD_CHANGED` - "Votre clé a changé" - Mot de passe changé
- `LOGIN_SUCCESSFUL` - "Bienvenue dans le boudoir..." - Connexion réussie
- `LOGOUT_SUCCESSFUL` - "Jusqu'à bientôt..." - Déconnexion réussie
- `REGISTRATION_SUCCESSFUL` - "Bienvenue au Cher Journal" - Inscription réussie
- `ACHIEVEMENT_UNLOCKED` - "Conquérant des Sens" - Succès/Achievement

## Codes d'info disponibles

- `LOADING` - "Un instant..." - Chargement en cours
- `NO_RESULTS` - "Aucune trace..." - Aucun résultat
- `WAIT_COMPLETED` - "Le moment est venu..." - Timer terminé
- `NEW_CHAPTER_AVAILABLE` - "Un nouveau murmure..." - Nouveau chapitre
- `AUTHOR_UPDATE` - "Un nouveau murmure..." - Mise à jour auteur

## Codes d'avertissement disponibles

- `CONFIRM_DELETE` - "Êtes-vous certaine?" - Confirmation suppression
- `UNSAVED_CHANGES` - "Vos mots s'échappent..." - Modifications non enregistrées
- `LIMITED_TIME_OFFER` - "Le sablier s'écoule..." - Offre limitée
- `SUBSCRIPTION_EXPIRING` - "Le sablier s'écoule..." - Abonnement expire
- `VOLUME_NOT_YET_AVAILABLE` - "Patience..." - Volume à venir

## Codes de promotion disponibles

- `EXCLUSIVE_BUNDLE` - "Une invitation exclusive" - Bundle spécial
- `PERSONALIZED_RECOMMENDATION` - "Le Boudoir vous connaît..." - Recommandation
- `NEW_AUTHOR_RELEASE` - "Un nouveau murmure..." - Nouvelle publication
- `SEASONAL_PROMOTION` - "Une saison de sensualité" - Promotion saisonnière

## Ajouter un nouveau message

### 1. Ajouter le message à `messages.ts`

```typescript
// Dans ERROR_MESSAGES, SUCCESS_MESSAGES, INFO_MESSAGES, WARNING_MESSAGES ou PROMO_MESSAGES
MY_NEW_MESSAGE: {
  title: 'Titre poétique et élégant',
  description: 'Description détaillée et explicative du message',
  type: MessageType.ERROR, // ou SUCCESS, INFO, WARNING
},
```

### 2. Utiliser le nouveau code

```typescript
showErrorToast(toast, 'MY_NEW_MESSAGE');
showSuccessToast(toast, 'MY_NEW_MESSAGE');
showInfoToast(toast, 'MY_NEW_MESSAGE');
showWarningToast(toast, 'MY_NEW_MESSAGE');
showPromoToast(toast, 'MY_NEW_MESSAGE');
```

## Format des messages

Chaque message a la structure suivante:

```typescript
{
  title: string;           // Titre poétique et élégant (ex: "Le secret est désormais vôtre")
  description: string;     // Message explicatif détaillé et sensible
  type: MessageType;       // 'error' | 'success' | 'info' | 'warning'
}
```

### Exemples de bons titres poétiques

```typescript
// ✅ Succès - Élégant et sensible
title: "Le secret est désormais vôtre"
description: "Votre achat a été traité avec succès. Plongez dans le monde qui vous attend."

// ✅ Erreur - Atmosphérique
title: "Un léger contretemps..."
description: "Impossible de charger le contenu demandé. Veuillez réessayer."

// ✅ Info - Mystérieux
title: "Un nouveau murmure..."
description: "Un nouveau chapitre vient d'être publié. Découvrez-le dès maintenant."

// ✅ Avertissement - Dramatique
title: "Le sablier s'écoule..."
description: "Cette invitation exclusive expire très bientôt. Ne laissez pas passer l'occasion."

// ❌ Mauvais - Générique et terne
title: "Erreur de chargement"
description: "Erreur"
```

### Recommandations pour les titres

- **Être poétique** - Utiliser un langage sensible et élégant
- **Rester court** - 4-6 mots idéalement
- **Créer une atmosphère** - Refléter l'émotion du message
- **Éviter les clichés** - Soyez créatif et original

## Fonction d'extraction d'erreur

Si votre API retourne des codes d'erreur au format `CODE: message`, la fonction `extractErrorCode()` les extraira automatiquement:

```typescript
// API retourne: "CHAPTER_NOT_FOUND: Chapter with id 123 not found"
const code = extractErrorCode(error); // Retourne: "CHAPTER_NOT_FOUND"
```

## Gestion d'erreurs dans les catch blocks

```typescript
try {
  await api.getChapter(id);
} catch (error) {
  showErrorToast(toast, error); // Utilise le code extractroit ou le message générique
}
```

## Avantages du système

✅ **Cohérence** - Tous les messages ont le même format et la même qualité
✅ **Esthétique** - Titres poétiques et élégants qui reflètent l'univers sensuel du Cher Journal
✅ **Maintenabilité** - Facile de mettre à jour les messages en un seul endroit
✅ **Traduction** - Structure idéale pour un futur support multi-langue
✅ **Testabilité** - Messages constants et testables indépendamment
✅ **UX** - Titres poétiques + descriptions claires pour une meilleure expérience utilisateur
✅ **Professionnalisme** - Messages sophistiqués et bien réfléchis plutôt que génériques

## Inspiration et Culture de Design

Ce système est conçu pour refléter l'essence du Cher Journal: **sensualité, élégance et mystère**.

Chaque message utilise un langage poétique qui:
- Invite l'utilisatrice à un voyage émotionnel
- Crée une atmosphère cohérente avec la marque
- Transforme les notifications ordinaires en moments mémorables
- Renforce le lien avec la communauté

### Exemples d'atmosphère

- **Mystère**: "Un nouveau murmure...", "L'instant est venu..."
- **Intimité**: "Le secret est désormais vôtre", "Bienvenue dans le boudoir..."
- **Attente**: "Le sablier s'écoule...", "Patience..."
- **Révélation**: "Vous avez repris la plume", "Votre plume a trouvé écho"
- **Sensualité**: "Une saison de sensualité", "Le Boudoir vous connaît..."
