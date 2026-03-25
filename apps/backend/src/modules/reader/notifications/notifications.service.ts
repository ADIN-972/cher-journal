import prisma from '../../../lib/prisma';
import fetch from 'node-fetch';

const DEFAULT_CATEGORIES = [
  { category: 'new-chapters', email: true, push: true },
  { category: 'promotions', email: true, push: false },
  { category: 'reviews', email: false, push: true },
  { category: 'newsletter', email: true, push: false },
];

export class NotificationPreferencesService {
  async getPreferences(userId: string) {
    const existing = await prisma.notificationPreference.findMany({
      where: { userId },
    });

    // Return existing prefs merged with defaults for missing categories
    return DEFAULT_CATEGORIES.map((def) => {
      const found = existing.find((e) => e.category === def.category);
      return {
        category: def.category,
        email: found ? found.email : def.email,
        push: found ? found.push : def.push,
      };
    });
  }

  async updatePreferences(
    userId: string,
    prefs: { category: string; email: boolean; push: boolean }[]
  ) {
    // Upsert each preference
    await Promise.all(
      prefs.map((pref) =>
        prisma.notificationPreference.upsert({
          where: {
            userId_category: { userId, category: pref.category },
          },
          create: {
            userId,
            category: pref.category,
            email: pref.email,
            push: pref.push,
          },
          update: {
            email: pref.email,
            push: pref.push,
          },
        })
      )
    );

    return this.getPreferences(userId);
  }

  // --- Push Token Management ---

  async savePushToken(userId: string, token: string, platform?: string) {
    return prisma.pushToken.upsert({
      where: { userId_token: { userId, token } },
      create: { userId, token, platform },
      update: { platform, updatedAt: new Date() },
    });
  }

  async removePushToken(userId: string, token: string) {
    try {
      await prisma.pushToken.delete({
        where: { userId_token: { userId, token } },
      });
    } catch {
      // Token may not exist
    }
  }

  async getUserPushTokens(userId: string): Promise<string[]> {
    const tokens = await prisma.pushToken.findMany({
      where: { userId },
      select: { token: true },
    });
    return tokens.map((t) => t.token);
  }

  // --- Send Push Notification via Expo Push API ---

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) {
    const tokens = await this.getUserPushTokens(userId);
    if (tokens.length === 0) return { sent: 0 };

    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default' as const,
      title,
      body,
      data: data || {},
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    return { sent: tokens.length, result };
  }

  async sendTestNotification(userId: string) {
    return this.sendPushNotification(
      userId,
      'Cher Journal',
      'Ceci est une notification de test. Tout fonctionne correctement !',
      { type: 'test' }
    );
  }
}
