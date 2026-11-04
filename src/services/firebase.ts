import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyAmMb4tzmSIOqgAt-2HEglMis_xKJVoS1k',
  authDomain: 'chat-195f6.firebaseapp.com',
  databaseURL: 'https://chat-195f6-default-rtdb.firebaseio.com',
  projectId: 'chat-195f6',
  appId: '1:88073647903:web:a460c3b822fc8dca65622a',
};

export class FirebaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirebaseConfigurationError';
  }
}

let services: { auth: Auth; database: Database } | undefined;
const authStorage = createAsyncStorage('minichat-auth');

function assertFirebaseConfig(): void {
  const placeholders = Object.entries(firebaseConfig)
    .filter(([, value]) => !value || value.includes('YOUR_') || value.includes('REGION'))
    .map(([key]) => key);

  if (placeholders.length > 0) {
    throw new FirebaseConfigurationError(
      `Cấu hình Firebase chưa hoàn tất. Hãy điền ${placeholders.join(', ')} trong src/services/firebase.ts bằng Web app config và URL Realtime Database lấy từ Firebase Console.`,
    );
  }
}

export function getFirebaseServices(): { auth: Auth; database: Database } {
  assertFirebaseConfig();
  if (services) {
    return services;
  }

  const app = getApps().find(existing => existing.name === '[DEFAULT]') ??
    initializeApp(firebaseConfig);

  let auth: Auth;
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(authStorage),
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'auth/already-initialized'
    ) {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }

  services = { auth, database: getDatabase(app) };
  return services;
}
