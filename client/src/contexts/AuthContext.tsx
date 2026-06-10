/**
 * AuthContext — wraps Supabase Auth and exposes:
 *  - user          : Supabase auth user (or null)
 *  - profile       : public.profiles row (or null)
 *  - loading       : true while the initial session is being resolved
 *  - signUp        : create a new account (customer or driver)
 *  - signIn        : email + password login
 *  - signOut       : log out
 *  - refreshProfile: re-fetch the profile row from Supabase
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile, UserRole } from "@/lib/database.types";

// ---- Types ----

interface SignUpOptions {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
  /** Optional affiliate referral code used at signup */
  referralCode?: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (opts: SignUpOptions) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ---- Context ----

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---- Provider ----

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the profile row for the current user.
  // Uses maybeSingle() so a missing row returns null instead of throwing.
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[Auth] Failed to fetch profile:", error.message);
      return null;
    }
    return data as Profile | null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) setProfile(p);
  }, [user, fetchProfile]);

  // Bootstrap: resolve the current session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ---- Auth actions ----

  const signUp = useCallback(
    async ({
      email,
      password,
      fullName,
      phone,
      role = "customer",
      referralCode,
    }: SignUpOptions): Promise<{ error: Error | null }> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            phone: phone ?? null,
            referral_code: referralCode ?? null,
          },
        },
      });

      if (error) return { error: new Error(error.message) };
      return { error: null };
    },
    []
  );

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: Error | null }> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: new Error(error.message) };
      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---- Hook ----

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
