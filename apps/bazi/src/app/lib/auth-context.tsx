'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase-client';
import { isInAppBrowser, openInExternalBrowser } from './detect-browser';

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? '';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  readingId: string | null;
  readingLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);

  const fetchReading = useCallback(async (currentUser: User) => {
    setReadingLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/user/reading', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReadingId(data.readingId ?? null);
    } catch {
      setReadingId(null);
    } finally {
      setReadingLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
      if (authUser) {
        fetchReading(authUser);
      } else {
        setReadingId(null);
      }
    });
    return unsub;
  }, [fetchReading]);

  const login = async () => {
    if (isInAppBrowser()) {
      openInExternalBrowser();
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
    setReadingId(null);
  };

  const getToken = async () => {
    if (!user) return null;
    return user.getIdToken();
  };

  const isAdmin = !!ADMIN_UID && user?.uid === ADMIN_UID;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, readingId, readingLoading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
