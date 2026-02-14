/**
 * Centralized message handler for all app notifications
 * Handles errors, success, info, and warning messages
 * Uses poetic and elegant titles to match Cher Journal's sensual aesthetic
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
    title: 'Un léger contretemps...',
    description: 'Le chapitre que vous recherchez n\'existe pas ou a été supprimé.',
    type: MessageType.ERROR,
  },
  VOLUME_NOT_FOUND: {
    title: 'Un léger contretemps...',
    description: 'Le volume que vous recherchez n\'existe pas ou a été supprimé.',
    type: MessageType.ERROR,
  },
  VOLUME_NUMBER_REQUIRED: {
    title: 'Un léger contretemps...',
    description: 'Un numéro de volume est requis pour cette opération.',
    type: MessageType.ERROR,
  },
  VOLUME_IS_FREE: {
    title: 'Le secret vous attend...',
    description: 'Ce volume est gratuit et ne nécessite pas d\'achat. Accédez-y directement.',
    type: MessageType.ERROR,
  },

  // Purchase/Payment errors
  USER_ALREADY_HAS_ACCESS: {
    title: 'Le secret est déjà vôtre',
    description: 'Vous avez déjà accès à ce contenu. Retournez le découvrir.',
    type: MessageType.ERROR,
  },
  INVALID_AMOUNT: {
    title: 'Un léger contretemps...',
    description: 'Le montant pour cette transaction est invalide. Le montant minimum est de 0,50€.',
    type: MessageType.ERROR,
  },
  PAYMENT_FAILED: {
    title: 'Un léger contretemps...',
    description: 'Votre paiement n\'a pas pu aboutir. Veuillez vérifier vos informations de crédit pour poursuivre l\'aventure.',
    type: MessageType.ERROR,
  },
  STRIPE_ERROR: {
    title: 'Un léger contretemps...',
    description: 'Une erreur s\'est produite lors du traitement de votre paiement. Veuillez réessayer.',
    type: MessageType.ERROR,
  },

  // Authentication errors
  UNAUTHORIZED: {
    title: 'Une porte fermée...',
    description: 'Vous devez être connecté pour accéder à ce contenu. Franchissez le seuil.',
    type: MessageType.ERROR,
  },
  SESSION_EXPIRED: {
    title: 'Le rideau s\'est fermé...',
    description: 'Votre session a expiré. Rouvrez la porte de votre univers.',
    type: MessageType.ERROR,
  },
  LOGIN_FAILED: {
    title: 'Les clés ne correspondent pas...',
    description: 'L\'email ou le mot de passe que vous avez entré est incorrect. Veuillez vérifier.',
    type: MessageType.ERROR,
  },
  EMAIL_ALREADY_EXISTS: {
    title: 'Déjà inscrite au journal...',
    description: 'Cet email est déjà associé à un compte. Connectez-vous ou utilisez une autre adresse.',
    type: MessageType.ERROR,
  },
  WEAK_PASSWORD: {
    title: 'Un mot de passe fragile...',
    description: 'Votre mot de passe doit être plus robuste : au moins 8 caractères avec majuscules, minuscules et chiffres.',
    type: MessageType.ERROR,
  },

  // Wait-to-Read errors
  WAIT_MAX_TIMERS_REACHED: {
    title: 'Patience...',
    description: 'Vous avez atteint le nombre maximum de timers simultanés. Attendez qu\'un se termine ou débloquez ce volume.',
    type: MessageType.ERROR,
  },
  WAIT_ALREADY_ACTIVE: {
    title: 'Le sablier s\'écoule déjà...',
    description: 'Un timer est déjà actif pour ce volume. Attendez que le temps fasse son œuvre.',
    type: MessageType.ERROR,
  },
  WAIT_NOT_FOUND: {
    title: 'Un léger contretemps...',
    description: 'Le timer que vous recherchez n\'existe pas ou a été supprimé.',
    type: MessageType.ERROR,
  },

  // Review errors
  REVIEW_NOT_FOUND: {
    title: 'Un léger contretemps...',
    description: 'L\'avis que vous recherchez n\'existe pas ou a été supprimé.',
    type: MessageType.ERROR,
  },
  CANNOT_REVIEW_VOLUME: {
    title: 'Vous n\'avez pas accès...',
    description: 'Vous ne pouvez pas laisser d\'avis sur ce volume car vous n\'y avez pas accès.',
    type: MessageType.ERROR,
  },

  // Promotion errors
  PROMOTION_NOT_FOUND: {
    title: 'Une invitation perdue...',
    description: 'La promotion que vous recherchez n\'existe pas ou a expiré.',
    type: MessageType.ERROR,
  },
  PROMOTION_EXPIRED: {
    title: 'Le temps a passé...',
    description: 'Cette promotion a expiré et n\'est plus disponible.',
    type: MessageType.ERROR,
  },
  PROMOTION_MAX_USES_REACHED: {
    title: 'L\'offre a épuisé son charme...',
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
    title: 'La connexion s\'est rompue...',
    description: 'Une erreur de connexion s\'est produite. Vérifiez votre accès Internet et réessayez.',
    type: MessageType.ERROR,
  },
  UNKNOWN_ERROR: {
    title: 'Un léger contretemps...',
    description: 'Quelque chose d\'inattendu s\'est passé. Veuillez réessayer ou contacter notre support.',
    type: MessageType.ERROR,
  },
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES: Record<string, Message> = {
  PURCHASE_SUCCESSFUL: {
    title: 'Le secret est désormais vôtre',
    description: 'Votre achat a été traité avec succès. Plongez dans le monde qui vous attend.',
    type: MessageType.SUCCESS,
  },
  VOLUME_UNLOCKED: {
    title: 'Le secret est désormais vôtre',
    description: 'Votre volume a été débloqué avec succès. Bonne lecture.',
    type: MessageType.SUCCESS,
  },
  CHAPTER_UNLOCKED: {
    title: 'Le secret est désormais vôtre',
    description: 'Votre chapitre a été débloqué avec succès. Que l\'aventure commence.',
    type: MessageType.SUCCESS,
  },
  WAIT_STARTED: {
    title: 'L\'attente commence...',
    description: 'Le timer a été lancé avec succès. Revenez dans le délai indiqué pour accéder au contenu.',
    type: MessageType.SUCCESS,
  },
  REVIEW_PUBLISHED: {
    title: 'Votre plume a trouvé écho',
    description: 'Votre avis a été publié avec succès et est désormais visible par la communauté.',
    type: MessageType.SUCCESS,
  },
  REVIEW_UPDATED: {
    title: 'Votre avis a été retouché',
    description: 'Vos paroles ont été mises à jour avec succès.',
    type: MessageType.SUCCESS,
  },
  REVIEW_DELETED: {
    title: 'Vos paroles se sont effacées',
    description: 'Votre avis a été supprimé avec succès.',
    type: MessageType.SUCCESS,
  },
  PROFILE_UPDATED: {
    title: 'Vous avez repris la plume',
    description: 'Vos informations de profil ont été mises à jour avec succès.',
    type: MessageType.SUCCESS,
  },
  PASSWORD_CHANGED: {
    title: 'Votre clé a changé',
    description: 'Votre mot de passe a été changé avec succès.',
    type: MessageType.SUCCESS,
  },
  LOGIN_SUCCESSFUL: {
    title: 'Bienvenue dans le boudoir...',
    description: 'Vous êtes maintenant connectée. Explorez tous les secrets qui vous attendent.',
    type: MessageType.SUCCESS,
  },
  LOGOUT_SUCCESSFUL: {
    title: 'Jusqu\'à bientôt...',
    description: 'Vous avez été déconnectée avec succès. À très vite.',
    type: MessageType.SUCCESS,
  },
  REGISTRATION_SUCCESSFUL: {
    title: 'Bienvenue au Cher Journal',
    description: 'Votre compte a été créé avec succès. Explorez notre univers sensuel et captivant.',
    type: MessageType.SUCCESS,
  },
  ACHIEVEMENT_UNLOCKED: {
    title: 'Conquérant des Sens',
    description: 'Félicitations! Vous avez débloqué un privilège spécial. Réclamez votre récompense.',
    type: MessageType.SUCCESS,
  },
};

/**
 * Info messages
 */
export const INFO_MESSAGES: Record<string, Message> = {
  LOADING: {
    title: 'Un instant...',
    description: 'Nous préparons votre expérience. Patientez un moment.',
    type: MessageType.INFO,
  },
  NO_RESULTS: {
    title: 'Aucune trace...',
    description: 'Aucun résultat ne correspond à votre recherche.',
    type: MessageType.INFO,
  },
  WAIT_COMPLETED: {
    title: 'Le moment est venu...',
    description: 'Votre timer a expiré. Le contenu vous attend maintenant.',
    type: MessageType.INFO,
  },
  NEW_CHAPTER_AVAILABLE: {
    title: 'Un nouveau murmure...',
    description: 'Un nouveau chapitre vient d\'être publié. Découvrez-le dès maintenant.',
    type: MessageType.INFO,
  },
  AUTHOR_UPDATE: {
    title: 'Un nouveau murmure...',
    description: 'L\'auteur a publié une mise à jour captivante. À lire sans tarder.',
    type: MessageType.INFO,
  },
};

/**
 * Warning messages
 */
export const WARNING_MESSAGES: Record<string, Message> = {
  CONFIRM_DELETE: {
    title: 'Êtes-vous certaine?',
    description: 'Cette action est irréversible. Êtes-vous sûre de vouloir continuer?',
    type: MessageType.WARNING,
  },
  UNSAVED_CHANGES: {
    title: 'Vos mots s\'échappent...',
    description: 'Vous avez des modifications non enregistrées. Êtes-vous sûre de vouloir partir?',
    type: MessageType.WARNING,
  },
  LIMITED_TIME_OFFER: {
    title: 'Le sablier s\'écoule...',
    description: 'Cette invitation exclusive expire très bientôt. Ne laissez pas passer l\'occasion.',
    type: MessageType.WARNING,
  },
  SUBSCRIPTION_EXPIRING: {
    title: 'Le sablier s\'écoule...',
    description: 'Votre Pass Privilège expire très bientôt. Prolongez votre aventure dès maintenant.',
    type: MessageType.WARNING,
  },
  VOLUME_NOT_YET_AVAILABLE: {
    title: 'Patience...',
    description: 'Ce volume n\'est pas encore accessible. Laissez-nous le temps de vous le préparer.',
    type: MessageType.WARNING,
  },
};

/**
 * Promo messages (Special category for promotional offers)
 */
export const PROMO_MESSAGES: Record<string, Message> = {
  EXCLUSIVE_BUNDLE: {
    title: 'Une invitation exclusive',
    description: 'Un nouveau bundle \'Nuits de Soie\' est disponible à prix doux pour une durée limitée.',
    type: MessageType.WARNING,
  },
  PERSONALIZED_RECOMMENDATION: {
    title: 'Le Boudoir vous connaît...',
    description: 'Basé sur vos dernières lectures, nous pensons que ce conte saura vous séduire.',
    type: MessageType.INFO,
  },
  NEW_AUTHOR_RELEASE: {
    title: 'Un nouveau murmure...',
    description: 'Votre auteur favori vient de publier une nouvelle histoire. À découvrir immédiatement.',
    type: MessageType.INFO,
  },
  SEASONAL_PROMOTION: {
    title: 'Une saison de sensualité',
    description: 'Profitez de nos offres saisonnières exclusives. Des histoires à prix réduits vous attendent.',
    type: MessageType.WARNING,
  },
};

/**
 * Get message by code
 * @param code - Message code (error, success, info, warning, or promo code)
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
    ...PROMO_MESSAGES,
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
