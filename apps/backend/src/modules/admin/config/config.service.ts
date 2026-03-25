import prisma from '../../../lib/prisma';
import crypto from 'crypto';
import { config } from '@cher-journal/config';

export interface ConfigFilter {
  category?: string;
  key?: string;
}

export interface ConfigValue {
  key: string;
  value: string | null;
  category: string;
  type: string;
  description?: string;
  isEncrypted: boolean;
  updatedAt: Date;
}

export interface UpdateConfigParams {
  key: string;
  value: string;
  updatedBy: string;
}

export class ConfigService {
  private encryptionKey: Buffer;

  constructor() {
    // Use SESSION_SECRET as encryption key for config values
    // In production, should use a dedicated key from env
    const key = config.sessionSecret || 'default-config-encryption-key-change-me';
    this.encryptionKey = crypto.scryptSync(key, 'salt', 32);
  }

  /**
   * Get all configurations, optionally filtered by category
   */
  async list(filters: ConfigFilter = {}) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.key) {
      where.key = { contains: filters.key, mode: 'insensitive' };
    }

    const configs = await prisma.systemConfig.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    });

    // Decrypt encrypted values
    return configs.map((c) => ({
      ...c,
      value: c.isEncrypted && c.value ? this.decrypt(c.value) : c.value,
    }));
  }

  /**
   * Get a single configuration by key
   */
  async getByKey(key: string): Promise<ConfigValue | null> {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config) {
      return null;
    }

    // @ts-ignore - pre-existing type mismatch with description field
    return {
      ...config,
      value: config.isEncrypted && config.value ? this.decrypt(config.value) : config.value,
    };
  }

  /**
   * Update or create a configuration
   */
  async upsert(params: UpdateConfigParams) {
    const existing = await prisma.systemConfig.findUnique({
      where: { key: params.key },
    });

    if (!existing) {
      throw new Error('CONFIG_NOT_FOUND');
    }

    // Encrypt if it's a secret type
    const finalValue = existing.isEncrypted
      ? this.encrypt(params.value)
      : params.value;

    return prisma.systemConfig.update({
      where: { key: params.key },
      data: {
        value: finalValue,
        updatedBy: params.updatedBy,
      },
    });
  }

  /**
   * Initialize default payment configurations if they don't exist
   */
  async initializeDefaults() {
    const defaults = [
      // Stripe Configuration
      {
        key: 'stripe.publishable_key',
        value: null,
        category: 'PAYMENT',
        type: 'STRING',
        description: 'Clé publique Stripe (pk_test_... ou pk_live_...)',
        isEncrypted: false,
      },
      {
        key: 'stripe.secret_key',
        value: null,
        category: 'PAYMENT',
        type: 'SECRET',
        description: 'Clé secrète Stripe (sk_test_... ou sk_live_...)',
        isEncrypted: true,
      },
      {
        key: 'stripe.webhook_secret',
        value: null,
        category: 'PAYMENT',
        type: 'SECRET',
        description: 'Secret webhook Stripe (whsec_...)',
        isEncrypted: true,
      },
      {
        key: 'stripe.mode',
        value: 'test',
        category: 'PAYMENT',
        type: 'STRING',
        description: 'Mode Stripe: test ou live',
        isEncrypted: false,
      },

      // Payment Settings
      {
        key: 'payment.default_currency',
        value: 'EUR',
        category: 'PAYMENT',
        type: 'STRING',
        description: 'Devise par défaut (EUR, USD, etc.)',
        isEncrypted: false,
      },
      {
        key: 'payment.supported_currencies',
        value: JSON.stringify(['EUR', 'USD', 'GBP']),
        category: 'PAYMENT',
        type: 'JSON',
        description: 'Devises supportées',
        isEncrypted: false,
      },
      {
        key: 'payment.tax_rate',
        value: '20',
        category: 'PAYMENT',
        type: 'NUMBER',
        description: 'Taux de TVA par défaut (%)',
        isEncrypted: false,
      },
      {
        key: 'payment.methods_enabled',
        value: JSON.stringify(['card']),
        category: 'PAYMENT',
        type: 'JSON',
        description: 'Moyens de paiement activés (card, sepa_debit, etc.)',
        isEncrypted: false,
      },

      // Email Configuration
      {
        key: 'email.provider',
        value: 'none',
        category: 'EMAIL',
        type: 'STRING',
        description: 'Fournisseur email (none, smtp, sendgrid, resend)',
        isEncrypted: false,
      },
      {
        key: 'email.from_address',
        value: 'noreply@cherjournal.com',
        category: 'EMAIL',
        type: 'STRING',
        description: 'Adresse email expéditeur',
        isEncrypted: false,
      },
      {
        key: 'email.from_name',
        value: 'Cher Journal',
        category: 'EMAIL',
        type: 'STRING',
        description: 'Nom de l\'expéditeur',
        isEncrypted: false,
      },

      // General Settings
      {
        key: 'site.name',
        value: 'Cher Journal',
        category: 'GENERAL',
        type: 'STRING',
        description: 'Nom du site',
        isEncrypted: false,
      },
      {
        key: 'site.url',
        value: 'http://localhost:5173',
        category: 'GENERAL',
        type: 'STRING',
        description: 'URL du site',
        isEncrypted: false,
      },
      {
        key: 'site.maintenance_mode',
        value: 'false',
        category: 'GENERAL',
        type: 'BOOLEAN',
        description: 'Mode maintenance activé',
        isEncrypted: false,
      },

      // Wait-to-Read Settings
      {
        key: 'wait.max_simultaneous_timers',
        value: '2',
        category: 'READER',
        type: 'NUMBER',
        description: 'Nombre maximum de chapitres avec timer actif simultanément',
        isEncrypted: false,
      },
      {
        key: 'wait.default_duration_hours',
        value: '24',
        category: 'READER',
        type: 'NUMBER',
        description: 'Durée d\'attente par défaut pour le freeToRead (en heures)',
        isEncrypted: false,
      },

      // Subscription Settings
      {
        key: 'subscription.price_cents',
        value: '999',
        category: 'PAYMENT',
        type: 'NUMBER',
        description: 'Prix mensuel de l\'abonnement Club Privé (en centimes). Ex: 999 = 9,99 €',
        isEncrypted: false,
      },
      {
        key: 'subscription.currency',
        value: 'eur',
        category: 'PAYMENT',
        type: 'STRING',
        description: 'Devise de l\'abonnement Club Privé (eur, usd, etc.)',
        isEncrypted: false,
      },
      {
        key: 'subscription.protagonist_discount_percent',
        value: '30',
        category: 'PAYMENT',
        type: 'NUMBER',
        description: 'Réduction Club Privé sur la perspective Protagoniste (en %). Ex: 30 = -30%',
        isEncrypted: false,
      },
      {
        key: 'pricing.chapter_bundle_discount_percent',
        value: '0',
        category: 'PAYMENT',
        type: 'NUMBER',
        description: 'Réduction appliquée au bundle chapitre entier (en %). 0 = pas de réduction. Ex: 25 = -25% sur la somme des volumes.',
        isEncrypted: false,
      },

      // Content Settings
      {
        key: 'content.moment_selection_chapter_id',
        value: null,
        category: 'CONTENT',
        type: 'STRING',
        description: 'ID du chapitre marqué comme "Sélection du moment" (featured chapter)',
        isEncrypted: false,
      },
    ];

    for (const def of defaults) {
      const existing = await prisma.systemConfig.findUnique({
        where: { key: def.key },
      });

      if (!existing) {
        await prisma.systemConfig.create({
          data: def,
        });
      }
    }

    return { initialized: defaults.length };
  }

  /**
   * Get payment configuration (for frontend display)
   */
  async getPaymentConfig() {
    const paymentConfigs = await this.list({ category: 'PAYMENT' });

    return {
      stripe: {
        publishableKey: paymentConfigs.find((c) => c.key === 'stripe.publishable_key')?.value,
        mode: paymentConfigs.find((c) => c.key === 'stripe.mode')?.value || 'test',
        // Don't expose secret keys
      },
      defaultCurrency: paymentConfigs.find((c) => c.key === 'payment.default_currency')?.value || 'EUR',
      supportedCurrencies: JSON.parse(
        paymentConfigs.find((c) => c.key === 'payment.supported_currencies')?.value || '["EUR"]'
      ),
      taxRate: parseFloat(
        paymentConfigs.find((c) => c.key === 'payment.tax_rate')?.value || '20'
      ),
      methodsEnabled: JSON.parse(
        paymentConfigs.find((c) => c.key === 'payment.methods_enabled')?.value || '["card"]'
      ),
    };
  }

  /**
   * Get wait-to-read configuration
   */
  async getWaitConfig() {
    const maxSimultaneousTimers = await this.getByKey('wait.max_simultaneous_timers');
    const defaultDurationHours = await this.getByKey('wait.default_duration_hours');

    return {
      maxSimultaneousTimers: maxSimultaneousTimers?.value
        ? parseInt(maxSimultaneousTimers.value, 10)
        : 2, // Default fallback
      defaultDurationHours: defaultDurationHours?.value
        ? parseInt(defaultDurationHours.value, 10)
        : 24, // Default fallback
    };
  }

  /**
   * Encrypt a value using AES-256-GCM
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt a value using AES-256-GCM
   */
  private decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return '[DECRYPTION_ERROR]';
    }
  }
}
