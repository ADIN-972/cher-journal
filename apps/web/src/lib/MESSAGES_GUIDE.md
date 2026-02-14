# Système Centralisé de Gestion des Messages

## Vue d'ensemble

Ce système permet de gérer tous les messages de l'application (erreurs, succès, infos, avertissements) de manière centralisée et cohérente.

## Structure

- **`messages.ts`** - Contient tous les codes de messages et leurs textes associés
- **`toastHelper.ts`** - Contient des fonctions utilitaires pour afficher les messages via le système de toasts

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

showPromoToast(toast, 'LIMITED_TIME_OFFER');
```

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

- `PURCHASE_SUCCESSFUL` - Achat réussi
- `WAIT_STARTED` - Timer lancé
- `REVIEW_PUBLISHED` - Avis publié
- `REVIEW_UPDATED` - Avis mis à jour
- `REVIEW_DELETED` - Avis supprimé
- `PROFILE_UPDATED` - Profil mis à jour
- `PASSWORD_CHANGED` - Mot de passe changé
- `LOGIN_SUCCESSFUL` - Bienvenue
- `LOGOUT_SUCCESSFUL` - Déconnexion réussie
- `REGISTRATION_SUCCESSFUL` - Inscription réussie

## Codes d'info disponibles

- `LOADING` - Chargement...
- `NO_RESULTS` - Aucun résultat
- `WAIT_COMPLETED` - Timer terminé

## Codes d'avertissement disponibles

- `CONFIRM_DELETE` - Confirmer la suppression
- `UNSAVED_CHANGES` - Modifications non enregistrées
- `LIMITED_TIME_OFFER` - Offre limitée

## Ajouter un nouveau message

### 1. Ajouter le message à `messages.ts`

```typescript
// Dans ERROR_MESSAGES, SUCCESS_MESSAGES, INFO_MESSAGES ou WARNING_MESSAGES
MY_NEW_ERROR: {
  title: 'Titre du message',
  description: 'Description détaillée du message',
  type: MessageType.ERROR,
},
```

### 2. Utiliser le nouveau code

```typescript
showErrorToast(toast, 'MY_NEW_ERROR');
```

## Format des messages

Chaque message a la structure suivante:

```typescript
{
  title: string;           // Titre affiché en gras
  description: string;     // Message explicatif détaillé
  type: MessageType;       // 'error' | 'success' | 'info' | 'warning'
}
```

### Exemples

```typescript
// ✅ Bon - Titre court et informatif
title: "Chapitre introuvable"
description: "Le chapitre que vous recherchez n'existe pas ou a été supprimé."

// ❌ Mauvais - Titre trop long ou non explicite
title: "Un chapitre n'a pas pu être trouvé dans la base de données"
description: "Erreur"
```

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

✅ **Cohérence** - Tous les messages ont le même format
✅ **Maintenabilité** - Facile de mettre à jour les messages
✅ **Traduction** - Futur support multi-langue
✅ **Testabilité** - Messages testables indépendamment
✅ **UX** - Titres élégants et descriptions claires
