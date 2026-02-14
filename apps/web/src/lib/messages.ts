/**
 * Centralized message handler for all app notifications
 * Handles errors, success, info, and warning messages
 */

export enum MessageType {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
}

export interface Message {
  title: string;
  description: string;
  type: MessageType;
}

/**
 * Error codes and their associated messages
 */
export const ERROR_MESSAGES: Record<string, Message> = {
  // Chapter/Volume errors
  CHAPTER_NOT_FOUND: {
    title: 'Chapitre introuvable',
    description: 'Le chapitre que vous recherchez n\'existe pas ou a été supprimé.',
    type: MessageType.ERROR,
  },
  VOLUME_NOT_FOUND: {
    title: 'Volume introuvable',
    description: 'Le volume que vous recherchez n\'existe pas ou a été supprimé.',
    type: MessageType.ERROR,
  },
  VOLUME_NUMBER_REQUIRED: {
    title: 'Numéro de volume manquant',
    description: 'Un numéro de volume est requis pour cette opération.',
    type: MessageType.ERROR,
  },
  VOLUME_IS_FREE: {
    title: 'Volume gratuit',
    description: 'Ce volume est gratuit et ne nécessite pas d\'achat.',
    type: MessageType.ERROR,
  },

  // Purchase/Payment errors
  USER_ALREADY_HAS_ACCESS: {
    title: 'Accès déjà obtenu',
    description: 'Vous avez déjà accès à ce contenu.',
    type: MessageType.ERROR,
  },
  INVALID_AMOUNT: {
    title: 'Montant invalide',
    description: 'Le montant pour cette transaction est invalide. Le montant minimum est de 0,50€.',
    type: MessageType.ERROR,
  },
  PAYMENT_FAILED: {
    title: 'Paiement échoué',
    description: 'Votre paiement n\'a pas pu être traité. Veuillez réessayer ou utiliser une autre méthode de paiement.',
    type: MessageType.ERROR,
  },
  STRIPE_ERROR: {
    title: 'Erreur de paiement',
    description: 'Une erreur s\'est produite lors du traitement de votre paiement. Veuillez réessayer.',
    type: MessageType.ERROR,
  },

  // Authentication errors
  UNAUTHORIZED: {
    title: 'Non autorisé',
    description: 'Vous devez être connecté pour accéder à ce contenu. Veuillez vous connecter.',
    type: MessageType.ERROR,
  },
  SESSION_EXPIRED: {
    title: 'Session expirée',
    description: 'Votre session a expiré. Veuillez vous reconnecter.',
    type: MessageType.ERROR,
  },
  LOGIN_FAILED: {
    title: 'Identifiants invalides',
    description: 'L\'email ou le mot de passe que vous avez entré est incorrect.',
    type: MessageType.ERROR,
  },
  EMAIL_ALREADY_EXISTS: {
    title: 'Email déjà utilisé',
    description: 'Cet email est déjà associé à un compte. Veuillez vous connecter ou utiliser un autre email.',
    type: MessageType.ERROR,
  },
  WEAK_PASSWORD: {
    title: 'Mot de passe faible',
    description: 'Votre mot de passe doit contenir au moins 8 caractères, incluant des majuscules, des minuscules et des chiffres.',
    type: MessageType.ERROR,
  },

  // Wait-to-Read errors
  WAIT_MAX_TIMERS_REACHED: {
    title: 'Limite de timers atteinte',
    description: 'Vous avez atteint le nombre maximum de timers simultanés. Attendez qu\'un se termine ou achetez le volume.',
    type: MessageType.ERROR,
  },
  WAIT_ALREADY_ACTIVE: {
    title: 'Timer déjà en cours',
    description: 'Un timer est déjà actif pour ce volume. Veuillez attendre qu\'il se termine.',
    type: MessageType.ERROR,
  },
  WAIT_NOT_FOUND: {
    title: 'Timer introuvable',
    description: 'Le timer que vous recherchez n\'existe pas ou a été supprimé.',
    type: MessageType.ERROR,
  },

  // Review errors
  REVIEW_NOT_FOUND: {
    title: 'Avis introuvable',
    description: 'L\'avis que vous recherchez n\'existe pas ou a été supprimé.',
    type: MessageType.ERROR,
  },
  CANNOT_REVIEW_VOLUME: {
    title: 'Impossible de laisser un avis',
    description: 'Vous n\'avez pas accès à ce volume, vous ne pouvez donc pas laisser d\'avis.',
    type: MessageType.ERROR,
  },

  // Promotion errors
  PROMOTION_NOT_FOUND: {
    title: 'Promotion introuvable',
    description: 'La promotion que vous recherchez n\'existe pas ou a expiré.',
    type: MessageType.ERROR,
  },
  PROMOTION_EXPIRED: {
    title: 'Promotion expirée',
    description: 'Cette promotion a expiré et n\'est plus disponible.',
    type: MessageType.ERROR,
  },
  PROMOTION_MAX_USES_REACHED: {
    title: 'Promotion limite atteinte',
    description: 'Cette promotion a atteint sa limite d\'utilisation.',
    type: MessageType.ERROR,
  },

  // Generic errors
  LOAD_ERROR: {
    title: 'Un léger contretemps...',
    description: 'Impossible de charger le contenu demandé. Veuillez réessayer.',
    type: MessageType.ERROR,
  },
  NETWORK_ERROR: {
    title: 'Erreur de connexion',
    description: 'Une erreur de connexion s\'est produite. Veuillez vérifier votre connexion Internet et réessayer.',
    type: MessageType.ERROR,
  },
  UNKNOWN_ERROR: {
    title: 'Une erreur s\'est produite',
    description: 'Quelque chose d\'inattendu s\'est passé. Veuillez réessayer ou contacter le support.',
    type: MessageType.ERROR,
  },
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES: Record<string, Message> = {
  PURCHASE_SUCCESSFUL: {
    title: 'Achat réussi',
    description: 'Votre achat a été traité avec succès. Vous pouvez maintenant accéder au contenu.',
    type: MessageType.SUCCESS,
  },
  WAIT_STARTED: {
    title: 'Timer lancé',
    description: 'Le timer a été lancé avec succès. Revenez dans le délai indiqué pour accéder au contenu.',
    type: MessageType.SUCCESS,
  },
  REVIEW_PUBLISHED: {
    title: 'Avis publié',
    description: 'Votre avis a été publié avec succès.',
    type: MessageType.SUCCESS,
  },
  REVIEW_UPDATED: {
    title: 'Avis mis à jour',
    description: 'Votre avis a été mis à jour avec succès.',
    type: MessageType.SUCCESS,
  },
  REVIEW_DELETED: {
    title: 'Avis supprimé',
    description: 'Votre avis a été supprimé avec succès.',
    type: MessageType.SUCCESS,
  },
  PROFILE_UPDATED: {
    title: 'Profil mis à jour',
    description: 'Vos informations de profil ont été mises à jour avec succès.',
    type: MessageType.SUCCESS,
  },
  PASSWORD_CHANGED: {
    title: 'Mot de passe changé',
    description: 'Votre mot de passe a été changé avec succès.',
    type: MessageType.SUCCESS,
  },
  LOGIN_SUCCESSFUL: {
    title: 'Bienvenue!',
    description: 'Vous êtes maintenant connecté.',
    type: MessageType.SUCCESS,
  },
  LOGOUT_SUCCESSFUL: {
    title: 'Déconnexion réussie',
    description: 'Vous avez été déconnecté avec succès.',
    type: MessageType.SUCCESS,
  },
  REGISTRATION_SUCCESSFUL: {
    title: 'Inscription réussie',
    description: 'Votre compte a été créé avec succès. Bienvenue!',
    type: MessageType.SUCCESS,
  },
};

/**
 * Info messages
 */
export const INFO_MESSAGES: Record<string, Message> = {
  LOADING: {
    title: 'Chargement...',
    description: 'Veuillez patienter pendant que nous chargeons le contenu.',
    type: MessageType.INFO,
  },
  NO_RESULTS: {
    title: 'Aucun résultat',
    description: 'Aucun résultat trouvé pour votre recherche.',
    type: MessageType.INFO,
  },
  WAIT_COMPLETED: {
    title: 'Timer terminé',
    description: 'Votre timer a expiré. Vous pouvez maintenant accéder au contenu.',
    type: MessageType.INFO,
  },
};

/**
 * Warning messages
 */
export const WARNING_MESSAGES: Record<string, Message> = {
  CONFIRM_DELETE: {
    title: 'Confirmer la suppression',
    description: 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer?',
    type: MessageType.WARNING,
  },
  UNSAVED_CHANGES: {
    title: 'Modifications non enregistrées',
    description: 'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter?',
    type: MessageType.WARNING,
  },
  LIMITED_TIME_OFFER: {
    title: 'Offre limitée',
    description: 'Cette promotion expire bientôt. Ne manquez pas cette occasion!',
    type: MessageType.WARNING,
  },
};

/**
 * Get message by code
 * @param code - Message code (error, success, info, or warning code)
 * @param defaultTitle - Default title if message not found
 * @param defaultDescription - Default description if message not found
 * @returns Message object
 */
export function getMessage(
  code: string,
  defaultTitle: string = 'Un léger contretemps...',
  defaultDescription: string = 'Une erreur s\'est produite. Veuillez réessayer.'
): Message {
  // Check all message types
  const allMessages = {
    ...ERROR_MESSAGES,
    ...SUCCESS_MESSAGES,
    ...INFO_MESSAGES,
    ...WARNING_MESSAGES,
  };

  return (
    allMessages[code] || {
      title: defaultTitle,
      description: defaultDescription,
      type: MessageType.ERROR,
    }
  );
}

/**
 * Extract error code from API error message
 * Handles both API error codes (like "CHAPTER_NOT_FOUND") and generic error messages
 * @param error - Error object or message string
 * @returns Error code or null
 */
export function extractErrorCode(error: any): string | null {
  if (!error) return null;

  // If error is a string, try to match known error codes
  if (typeof error === 'string') {
    // Check if the string is a known error code
    if (ERROR_MESSAGES[error]) {
      return error;
    }
    // Try to extract error code from message format "CODE: message"
    const match = error.match(/^([A-Z_]+):/);
    if (match) {
      return match[1];
    }
  }

  // If error is an object with code property
  if (error.code && ERROR_MESSAGES[error.code]) {
    return error.code;
  }

  // If error is an object with message property
  if (error.message) {
    return extractErrorCode(error.message);
  }

  return null;
}

/**
 * Get error message with title and description
 * @param error - Error object, message string, or error code
 * @param defaultTitle - Default title if not found
 * @param defaultDescription - Default description if not found
 * @returns Object with title and description
 */
export function getErrorMessage(
  error: any,
  defaultTitle: string = 'Un léger contretemps...',
  defaultDescription?: string
): { title: string; description: string } {
  const code = extractErrorCode(error);
  const message = getMessage(code || 'UNKNOWN_ERROR', defaultTitle, defaultDescription || 'Une erreur s\'est produite.');

  return {
    title: message.title,
    description: message.description,
  };
}
