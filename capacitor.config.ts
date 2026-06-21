import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor config — wraps the Vite web build (`dist/`) into a native app.
 *
 * IMPORTANT: change `appId` to your own reverse-domain bundle id before the
 * first App Store / Play submission (it can't be changed after release).
 */
const config: CapacitorConfig = {
  appId: 'com.catmatch.app',
  appName: 'Cat Match',
  webDir: 'dist',
  backgroundColor: '#FFF4DC',
  ios: {
    contentInset: 'always',
    backgroundColor: '#FFF4DC',
  },
  android: {
    backgroundColor: '#FFF4DC',
  },
};

export default config;
