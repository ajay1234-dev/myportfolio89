"use client";

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // Auto-set cookie if admin is already signed in
      if (u && u.email === ADMIN_EMAIL) {
        document.cookie = `admin_session=1; path=/; max-age=86400; SameSite=Strict`;
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email === ADMIN_EMAIL) {
        document.cookie = `admin_session=1; path=/; max-age=86400; SameSite=Strict`;
      } else {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      // User closed popup or cancelled — silently ignore
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    document.cookie = 'admin_session=; max-age=0; path=/';
  }, []);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
