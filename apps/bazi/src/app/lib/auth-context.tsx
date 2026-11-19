'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from './firebase-client';
import { isLineBrowser, openInExternalBrowser } from './detect-browser';
import { useModalStore } from './modal-store';
import { getSessionRemainingMs } from './session';
import { getClientLocale } from './i18n/client-locale';
import { translate } from './i18n/messages';

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? '';
const REDIRECT_KEY = 'loginRedirect';

// 使用者自己關掉登入視窗，不需要提示錯誤
const IGNORED_LOGIN_ERRORS = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

function showLoginError(code?: string) {
  const locale = getClientLocale();
  useModalStore.getState().show({
    title: translate(locale, 'auth.failedTitle'),
    message:
      code === 'auth/popup-blocked'
        ? translate(locale, 'auth.popupBlocked')
        : `${translate(locale, 'auth.failed')}${code ? translate(locale, 'auth.errorCode', { code }) : ''}`,
    confirmLabel: translate(locale, 'common.gotIt'),
    onConfirm: () => undefined,
  });
}

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

function expireSession() {
  signOut(auth);
  const locale = getClientLocale();
  useModalStore.getState().show({
    title: translate(locale, 'auth.expiredTitle'),
    message: translate(locale, 'auth.expired'),
    confirmLabel: translate(locale, 'common.gotIt'),
    onConfirm: () => undefined,
  });
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
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;

    const unsub = onAuthStateChanged(auth, (authUser) => {
      clearTimeout(expiryTimer);

      // 距離最後一次登入超過 7 天就強制登出；還沒到的話，排一個計時器在到期時登出（網頁一直開著的情況）
      if (authUser) {
        const remainingMs = getSessionRemainingMs(Date.parse(authUser.metadata.lastSignInTime ?? ''));
        if (!(remainingMs > 0)) {
          expireSession();
          return;
        }
        // setTimeout 上限約 24.8 天，7 天在範圍內
        expiryTimer = setTimeout(expireSession, remainingMs);
      }

      setUser(authUser);
      setLoading(false);
      if (authUser) {
        fetchReading(authUser);
      } else {
        setReadingId(null);
      }
    });
    return () => {
      unsub();
      clearTimeout(expiryTimer);
    };
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
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code && IGNORED_LOGIN_ERRORS.includes(code)) return;
      console.error('Login error:', error);
      showLoginError(code);
    }
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
