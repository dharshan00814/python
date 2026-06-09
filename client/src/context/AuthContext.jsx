import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { roleOptions } from "../data/mockData.js";
import { hasSupabase, supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);

const storageKey = "hostel-mess-auth";

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user) {
  if (!user) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(hasSupabase);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const currentUser = {
          email: data.session.user.email,
          role: data.session.user.user_metadata?.role || "Hostel Admin",
          name: data.session.user.user_metadata?.name || data.session.user.email,
        };

        setUser(currentUser);
        storeUser(currentUser);
      }

      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const nextUser = {
          email: session.user.email,
          role: session.user.user_metadata?.role || "Hostel Admin",
          name: session.user.user_metadata?.name || session.user.email,
        };

        setUser(nextUser);
        storeUser(nextUser);
      } else {
        setUser(null);
        storeUser(null);
      }

      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async signIn({ email, password, role }) {
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
      }

      const nextUser = { email, role: role || "Hostel Admin", name: email.split("@")[0] };
      setUser(nextUser);
      storeUser(nextUser);
      return nextUser;
    },
    async signUp({ email, password, role, name }) {
      if (supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role, name } },
        });
        if (error) {
          throw error;
        }
      }

      const nextUser = { email, role: role || "Hostel Admin", name: name || email.split("@")[0] };
      setUser(nextUser);
      storeUser(nextUser);
      return nextUser;
    },
    async requestPasswordReset(email) {
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          throw error;
        }
      }

      return { ok: true };
    },
    signOut() {
      if (supabase) {
        void supabase.auth.signOut();
      }

      setUser(null);
      storeUser(null);
    },
    roleOptions,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}