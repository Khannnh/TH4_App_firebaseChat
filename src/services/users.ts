import {
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
  type DatabaseReference,
} from 'firebase/database';
import { getFirebaseServices } from './firebase';
import type { Contact, Presence, UserProfile } from '../types';

type UsersListener = (users: Contact[]) => void;
type ListenerError = (error: Error) => void;
type PresenceSession = {
  active: boolean;
  unsubscribe: () => void;
  connectionRef: DatabaseReference | undefined;
  lastSeenRef: DatabaseReference;
};

const presenceSessions = new Map<string, PresenceSession>();

export function subscribeToUsers(
  currentUid: string,
  onUsers: UsersListener,
  onError: ListenerError,
): () => void {
  const { database } = getFirebaseServices();
  const profilesRef = ref(database, 'users');
  const presenceListeners = new Map<string, () => void>();
  const presenceByUid = new Map<string, Presence>();
  let profilesByUid: Record<string, UserProfile> = {};
  let active = true;

  const emit = () => {
    if (!active) {
      return;
    }
    onUsers(
      Object.values(profilesByUid)
        .filter(profile => profile.uid !== currentUid)
        .map(profile => ({
          ...profile,
          ...(presenceByUid.get(profile.uid) ?? { isOnline: false, lastSeen: null }),
        }))
        .sort((left, right) => left.displayName.localeCompare(right.displayName, 'vi')),
    );
  };

  const unsubscribeProfiles = onValue(
    profilesRef,
    snapshot => {
      const profiles: Record<string, UserProfile> = {};
      snapshot.forEach(child => {
        const value = child.val() as
          | Pick<UserProfile, 'displayName' | 'avatarUrl' | 'createdAt'>
          | null;
        if (child.key && value && typeof value.displayName === 'string') {
          profiles[child.key] = { ...value, uid: child.key, email: '' };
        }
      });
      profilesByUid = profiles;

      for (const [uid, unsubscribe] of presenceListeners) {
        if (!profiles[uid]) {
          unsubscribe();
          presenceListeners.delete(uid);
          presenceByUid.delete(uid);
        }
      }

      for (const uid of Object.keys(profiles)) {
        if (uid === currentUid || presenceListeners.has(uid)) {
          continue;
        }
        presenceByUid.set(uid, { isOnline: false, lastSeen: null });
        const unsubscribe = onValue(
          ref(database, `presence/${uid}`),
          presenceSnapshot => {
            const value = presenceSnapshot.val() as
              | { connections?: Record<string, boolean>; lastSeen?: number }
              | null;
            presenceByUid.set(uid, {
              isOnline:
                !!value?.connections &&
                Object.values(value.connections).some(connected => connected === true),
              lastSeen: typeof value?.lastSeen === 'number' ? value.lastSeen : null,
            });
            emit();
          },
          onError,
        );
        presenceListeners.set(uid, unsubscribe);
      }
      emit();
    },
    onError,
  );

  return () => {
    active = false;
    unsubscribeProfiles();
    presenceListeners.forEach(unsubscribe => unsubscribe());
    presenceListeners.clear();
  };
}

export function startPresence(uid: string): () => void {
  const { database } = getFirebaseServices();
  const connectedRef = ref(database, '.info/connected');
  const connectionsRef = ref(database, `presence/${uid}/connections`);
  const lastSeenRef = ref(database, `presence/${uid}/lastSeen`);
  const previousSession = presenceSessions.get(uid);
  if (previousSession) {
    void stopPresenceForUser(uid).catch(error => {
      console.error('Không thể dọn dẹp presence trước khi khởi tạo lại:', error);
    });
  }
  const session: PresenceSession = {
    active: true,
    unsubscribe: () => {},
    connectionRef: undefined,
    lastSeenRef,
  };
  session.unsubscribe = onValue(connectedRef, snapshot => {
    if (!session.active) {
      return;
    }
    if (snapshot.val() !== true) {
      session.connectionRef = undefined;
      return;
    }
    if (session.connectionRef) {
      return;
    }

    const connectionRef = push(connectionsRef);
    session.connectionRef = connectionRef;
    if (!connectionRef.key) {
      console.error('Không thể tạo presence connection key.');
      return;
    }

    void onDisconnect(connectionRef)
      .remove()
      .then(() =>
        session.active ? onDisconnect(lastSeenRef).set(serverTimestamp()) : undefined,
      )
      .then(() => (session.active ? set(connectionRef, true) : undefined))
      .catch(error => {
        console.error('Không thể cập nhật presence Firebase:', error);
      });
  });
  presenceSessions.set(uid, session);

  return () => {
    void stopPresenceForUser(uid).catch(error => {
      console.error('Không thể dọn dẹp presence Firebase:', error);
    });
  };
}

export async function stopPresenceForUser(uid: string): Promise<void> {
  const session = presenceSessions.get(uid);
  if (!session) {
    return;
  }

  session.active = false;
  session.unsubscribe();
  presenceSessions.delete(uid);
  const connectionRef = session.connectionRef;
  if (!connectionRef) {
    return;
  }

  await remove(connectionRef);
  await set(session.lastSeenRef, serverTimestamp());
  await Promise.all([
    onDisconnect(connectionRef).cancel(),
    onDisconnect(session.lastSeenRef).cancel(),
  ]);
}
