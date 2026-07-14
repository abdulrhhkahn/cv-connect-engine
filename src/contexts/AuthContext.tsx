import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user:                User | null;
  loading:             boolean;
  isPasswordRecovery:  boolean;
  login:               (email: string, password: string) => Promise<void>;
  signup:              (name: string, email: string, password: string, role: UserRole, company?: string) => Promise<{ confirmationRequired: boolean }>;
  logout:              () => Promise<void>;
  sendPasswordReset:   (email: string) => Promise<void>;
  updatePassword:      (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ── Helpers ───────────────────────────────────────────────────

async function fetchUserRow(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, company')
    .eq('id', id)
    .maybeSingle();
  if (error) { console.error('fetchUserRow', error); return null; }
  if (!data)  return null;
  return {
    id:      data.id,
    email:   data.email,
    name:    data.name,
    role:    data.role as UserRole,
    company: data.company ?? undefined,
  };
}

function extractMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && 'message' in err)
    return String((err as { message: unknown }).message);
  return JSON.stringify(err);
}

// ── Provider ──────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]                             = useState<User | null>(null);
  const [loading, setLoading]                       = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    /**
     * FIX: Use onAuthStateChange exclusively (including INITIAL_SESSION)
     * instead of getSession() + onAuthStateChange separately.
     *
     * The old pattern ran getSession() first, called setLoading(false),
     * and THEN onAuthStateChange fired PASSWORD_RECOVERY — by which point
     * App.tsx had already routed the user to the dashboard.
     *
     * With INITIAL_SESSION, the event fires before we set loading=false,
     * so PASSWORD_RECOVERY is detected in the correct order every time.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        // ── Password reset link clicked ──────────────────────
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          if (session?.user) setUser(await fetchUserRow(session.user.id));
          setLoading(false);
          return;
        }

        // ── Sign out ─────────────────────────────────────────
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsPasswordRecovery(false);
          setLoading(false);
          return;
        }

        // ── All other events (INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED) ──
        if (session?.user) {
          let u = await fetchUserRow(session.user.id);

          // First-time OAuth sign-in — public.users row doesn't exist yet
          if (!u && event === 'SIGNED_IN') {
            await seedOAuthUser({
              id:            session.user.id,
              email:         session.user.email,
              user_metadata: session.user.user_metadata ?? {},
            });
            u = await fetchUserRow(session.user.id);
          }

          setUser(u);
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth actions ─────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(extractMessage(error));
  };

  const signup = async (
    name:     string,
    email:    string,
    password: string,
    role:     UserRole,
    company?: string,
  ): Promise<{ confirmationRequired: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email:    email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name:    name.trim(),
          role,
          company: company?.trim() ?? null,
        },
      },
    });

    if (error) throw new Error(extractMessage(error));
    if (!data.user) throw new Error('Sign-up failed — please try again.');
    return { confirmationRequired: !data.session };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange fires SIGNED_OUT → clears user + recovery flag
  };

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: window.location.origin },
    );
    if (error && !extractMessage(error).toLowerCase().includes('not found'))
      throw new Error(extractMessage(error));
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(extractMessage(error));
    toast.success('Password updated — you are now logged in.');
    setIsPasswordRecovery(false);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, isPasswordRecovery,
      login, signup, logout,
      sendPasswordReset, updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── OAuth first-sign-in seeder (kept here to avoid circular imports) ──

async function seedOAuthUser(authUser: {
  id: string;
  email?: string;
  user_metadata: Record<string, string>;
}): Promise<void> {
  const name  = authUser.user_metadata?.full_name
    || authUser.user_metadata?.name
    || authUser.email?.split('@')[0]
    || 'User';
  const email = authUser.email ?? '';

  const { error: userErr } = await supabase
    .from('users')
    .insert({ id: authUser.id, email, name, role: 'candidate', company: null });
  if (userErr && userErr.code !== '23505') {
    console.error('seedOAuthUser users insert', userErr);
    return;
  }

  const { error: profileErr } = await supabase
    .from('candidate_profiles')
    .insert({
      user_id: authUser.id, name, email,
      title: '', summary: '', skills: [], experience: '', education: '',
      cv_url: null, cv_file_name: null, avatar_url: null, phone: null,
      linked_in: null, portfolio: null, location: null,
      industry_experience: [], soft_skills: [], cultural_fit: [],
    });
  if (profileErr && profileErr.code !== '23505') {
    console.error('seedOAuthUser profile insert', profileErr);
  }
}
