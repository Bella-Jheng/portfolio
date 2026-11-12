'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase-client';

// 使用者自己關掉登入視窗，不算錯誤
const IGNORED_LOGIN_ERRORS = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

interface AuthValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  login: () => Promise<string | null>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    // 舊版的存取碼已經不用了，順手從這台裝置清掉
    try {
      localStorage.removeItem('rental-helper:access-code');
    } catch {
      /* ignore */
    }
    if (!auth) return;
    return onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
  }, []);

  /** 回傳錯誤訊息；成功或使用者自己取消回傳 null */
  const login = async (): Promise<string | null> => {
    if (!auth) return '這個網站還沒設定 Google 登入';
    try {
      await signInWithPopup(auth, googleProvider);
      return null;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code && IGNORED_LOGIN_ERRORS.includes(code)) return null;
      if (code === 'auth/popup-blocked') return '瀏覽器擋下了登入視窗，請允許彈出視窗後再試一次';
      return `登入失敗，請稍後再試${code ? `（${code}）` : ''}`;
    }
  };

  const logout = async () => {
    if (auth) await signOut(auth);
  };

  const getToken = async () => (user ? user.getIdToken() : null);

  return (
    <AuthContext.Provider value={{ user, loading, configured: isFirebaseConfigured, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth 必須在 AuthProvider 裡使用');
  return value;
}
