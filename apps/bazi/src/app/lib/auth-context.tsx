'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from './firebase-client';
import { isLineBrowser, openInExternalBrowser } from './detect-browser';

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? '';
const REDIRECT_KEY = 'loginRedirect';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  readingId: string | null;
  readingLoading: boolean;
  login: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);
  const prevUserRef = useRef<User | null | undefined>(undefined);

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

  // After a fresh login (null → User), consume the pending redirect if any.
  useEffect(() => {
    const wasLoggedOut = prevUserRef.current === null;
    prevUserRef.current = user;
    if (!wasLoggedOut || !user) return;

    const path = sessionStorage.getItem(REDIRECT_KEY);
    if (!path) return;
    sessionStorage.removeItem(REDIRECT_KEY);
    router.replace(path);
  }, [user, router]);

  const login = async (redirectTo?: string) => {
    if (redirectTo) sessionStorage.setItem(REDIRECT_KEY, redirectTo);
    if (isLineBrowser()) {
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
