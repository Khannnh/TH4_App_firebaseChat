import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import { getFirebaseServices, FirebaseConfigurationError } from '../services/firebase';
import { getAuthErrorMessage, loginWithEmail, logout, registerWithEmail } from '../services/auth';
import type { UserProfile } from '../types';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configurationError: string | null;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [configurationError, setConfigurationError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let profileRequest = 0;
    let unsubscribe = () => {};
    let unsubscribeProfile = () => {};
    let unsubscribePrivateProfile = () => {};

    try {
      const { auth, database } = getFirebaseServices();
      unsubscribe = onAuthStateChanged(
        auth,
        nextUser => {
          const request = ++profileRequest;
          unsubscribeProfile();
          unsubscribePrivateProfile();
          unsubscribeProfile = () => {};
          unsubscribePrivateProfile = () => {};
          if (!active) {
            return;
          }
          setUser(nextUser);
          setProfileError(null);
          if (!nextUser) {
            setProfile(null);
            setLoading(false);
            return;
          }

          setLoading(true);
          let publicProfile: Pick<UserProfile, 'displayName' | 'createdAt'> | null = null;
          let privateEmail = nextUser.email ?? '';
          let publicLoaded = false;
          let privateLoaded = false;
          const publishProfile = () => {
            if (!active || request !== profileRequest || !publicLoaded || !privateLoaded) {
              return;
            }
              setProfile({
                uid: nextUser.uid,
                displayName: publicProfile?.displayName ?? nextUser.displayName ?? 'Người dùng',
                email: privateEmail,
                createdAt: publicProfile?.createdAt ?? 0,
              });
            setLoading(false);
          };

          unsubscribeProfile = onValue(
            ref(database, `users/${nextUser.uid}`),
            snapshot => {
              const value = snapshot.val() as
                | Pick<UserProfile, 'displayName' | 'createdAt'>
                | null;
              publicProfile = value;
              publicLoaded = true;
              publishProfile();
            },
            error => {
              if (active && request === profileRequest) {
                setProfileError(getAuthErrorMessage(error));
              }
              publicLoaded = true;
              publishProfile();
            },
          );
          unsubscribePrivateProfile = onValue(
            ref(database, `userPrivate/${nextUser.uid}/email`),
            snapshot => {
              const value = snapshot.val();
              if (typeof value === 'string') {
                privateEmail = value;
              }
              privateLoaded = true;
              publishProfile();
            },
            error => {
              if (active && request === profileRequest) {
                setProfileError(getAuthErrorMessage(error));
              }
              privateLoaded = true;
              publishProfile();
            },
          );
        },
        error => {
          if (active) {
            setProfileError(getAuthErrorMessage(error));
            setLoading(false);
          }
        },
      );
    } catch (error) {
      if (active) {
        setConfigurationError(
          error instanceof FirebaseConfigurationError
            ? error.message
            : `Không thể khởi tạo Firebase: ${getAuthErrorMessage(error)}`,
        );
        setLoading(false);
      }
    }

    return () => {
      active = false;
      unsubscribe();
      unsubscribeProfile();
      unsubscribePrivateProfile();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configurationError,
      profileError,
      signIn: loginWithEmail,
      register: registerWithEmail,
      signOut: logout,
    }),
    [user, profile, loading, configurationError, profileError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
