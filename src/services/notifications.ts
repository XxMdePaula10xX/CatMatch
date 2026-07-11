import { isNativeApp } from './platform';

const DAILY_ID = 1001;

/**
 * Asks for notification permission and schedules a daily reminder to come back
 * and play. No-op on web (only runs inside the native app). Safe to call on
 * every launch — it replaces any existing reminder instead of stacking.
 */
export async function setupDailyReminder(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { LocalNotifications } = await import(
      '@capacitor/local-notifications'
    );
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_ID,
          title: '🐱 CatMatch3',
          body: 'Os gatinhos sentem sua falta! Jogue o desafio diário e suba no ranking.',
          // Repeats every day at 19:00 local time.
          schedule: { on: { hour: 19, minute: 0 }, allowWhileIdle: true },
        },
      ],
    });
  } catch (e) {
    console.warn('setupDailyReminder falhou', e);
  }
}

/**
 * Clears the app icon badge and delivered reminders. Call on launch and every
 * time the app comes to the foreground. Tries both badge APIs because some iOS
 * versions clear reliably only via set(0) and not clear() (which left users
 * with a stuck "1").
 */
export async function clearBadge(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Badge } = await import('@capawesome/capacitor-badge');
    try {
      await Badge.set({ count: 0 });
    } catch {
      /* ignore */
    }
    try {
      await Badge.clear();
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
  try {
    const { LocalNotifications } = await import(
      '@capacitor/local-notifications'
    );
    await LocalNotifications.removeAllDeliveredNotifications();
  } catch {
    /* ignore */
  }
}
