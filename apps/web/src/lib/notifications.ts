/**
 * Notification service for browser notifications
 */

export class NotificationService {
  /**
   * Request permission for browser notifications
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Show a notification
   */
  static async show(title: string, options?: NotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click event
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Show a timer completion notification
   */
  static async showTimerComplete(chapterTitle: string, volumeNumber: number): Promise<void> {
    await this.show(
      'Timer terminé !',
      {
        body: `Le volume ${volumeNumber} de "${chapterTitle}" est maintenant disponible.`,
        tag: 'timer-complete',
        requireInteraction: true,
      }
    );
  }

  /**
   * Check if notifications are supported and enabled
   */
  static isSupported(): boolean {
    return 'Notification' in window && Notification.permission !== 'denied';
  }

  /**
   * Get current permission status
   */
  static getPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }
}
