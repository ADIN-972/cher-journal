import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SettingsService {
  /**
   * Get all settings
   */
  async getAll() {
    return prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Get a setting by key
   */
  async getByKey(key: string) {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    return setting;
  }

  /**
   * Upsert a setting (create or update)
   */
  async upsert(key: string, value: string) {
    return prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  /**
   * Get default chapter prices
   */
  async getDefaultPrices() {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['DEFAULT_PRICE_FREE_TO_READ', 'DEFAULT_PRICE_PAYWALL', 'DEFAULT_PRICE_EPILOGUE'],
        },
      },
    });

    const defaults = {
      priceFreeToRead: 200, // 2€ par défaut
      pricePaywall: 300, // 3€ par défaut
      priceEpilogue: 400, // 4€ par défaut
    };

    settings.forEach((setting) => {
      const value = parseInt(setting.value, 10);
      if (isNaN(value)) return;

      if (setting.key === 'DEFAULT_PRICE_FREE_TO_READ') {
        defaults.priceFreeToRead = value;
      } else if (setting.key === 'DEFAULT_PRICE_PAYWALL') {
        defaults.pricePaywall = value;
      } else if (setting.key === 'DEFAULT_PRICE_EPILOGUE') {
        defaults.priceEpilogue = value;
      }
    });

    return defaults;
  }
}

export const settingsService = new SettingsService();
