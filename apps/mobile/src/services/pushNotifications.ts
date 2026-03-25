import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api/client';

/**
 * Check if push notifications are available (not in Expo Go on SDK 53+).
 */
function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Lazy-load expo-notifications to avoid crash in Expo Go.
 */
async function getNotificationsModule() {
  if (isExpoGo()) {
    console.log('[Push] Running in Expo Go — push notifications are not available');
    return null;
  }
  return await import('expo-notifications');
}

/**
 * Setup notification handler (called only in dev builds).
 */
async function setupHandler() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Try to set up handler on load (non-blocking)
setupHandler().catch(() => {});

/**
 * Register for push notifications and return the Expo push token.
 * Sends the token to the backend for storage.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return null;

  if (!Device.isDevice) {
    console.log('[Push] Not a physical device, skipping registration');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission not granted');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C5A059',
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenData.data;

  console.log('[Push] Expo push token:', token);

  try {
    await api.post('/me/push-token', { token, platform: Platform.OS });
    console.log('[Push] Token registered with backend');
  } catch (err) {
    console.error('[Push] Failed to register token with backend:', err);
  }

  return token;
}

/**
 * Remove the push token from the backend (on logout).
 */
export async function unregisterPushToken(): Promise<void> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await api.delete('/me/push-token', { data: { token: tokenData.data } });
  } catch {
    // Ignore errors on unregister
  }
}

/**
 * Check if push notifications are supported in current environment.
 */
export function isPushSupported(): boolean {
  return !isExpoGo() && Device.isDevice;
}
