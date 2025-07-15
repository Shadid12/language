'use client';

import {
  createContext,
  useEffect,
  useState,
  PropsWithChildren,
} from 'react';

import { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';

// --------------------
// Context definition
// --------------------
export const SupabaseContext = createContext<{
  supabase: SupabaseClient;
  user: User | null;
  signInWithOtp: (email: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({
  supabase: {} as SupabaseClient,
  user: null,
  signInWithOtp: async () => {},
  signUp: async () => {},
  signInWithPassword: async () => {},
  signOut: async () => {},
});

// --------------------
// Provider component
// --------------------
export default function SupabaseProvider({ children }: PropsWithChildren) {
  const supabase = supabaseBrowser();
  const [user, setUser] = useState<User | null>(null);

  // Bootstrap & subscribe to auth changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) =>
      setUser(session?.user ?? null),
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Wrapper helpers
  const signInWithOtp = (email: string) =>
    supabase.auth.signInWithOtp({ email }).then(({ error }) => {
      if (error) throw error;
    });

  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password }).then(({ error }) => {
      if (error) throw error;
    });

  const signInWithPassword = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }).then(({ error }) => {
      if (error) throw error;
    });

  const signOut = () =>
    supabase.auth.signOut().then(({ error }) => {
      if (error) throw error;
    });

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        user,
        signInWithOtp,
        signUp,
        signInWithPassword,
        signOut,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}
