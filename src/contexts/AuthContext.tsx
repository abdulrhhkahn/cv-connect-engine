import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user:                User | null;
  loading:             boolean;
  isPasswordRecovery:  boolean;
  login:               (email: string, password: string) => Promise<void>;
  /**
   * Returns true when Supabase requires email confirmation before the user
   * can log in (default in new projects). Landing.tsx shows "check your inbox".
   */
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

// ── helpers ──────────────────────────────────────────────────

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

/** Pull a human-readable message out of any thrown value */
function extractMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  // Native Error
  if (err instanceof Error) return err.message;
  // Supabase PostgrestError / AuthError (plain objects with .message)
  if (typeof err === 'object' && 'message' in err)
    return String((err as { message: unknown }).message);
  return JSON.stringify(err);
}

// ── provider ─────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]                             = useState<User | null>(null);
  const [loading, setLoading]                       = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) setUser(await fetchUserRow(session.user.id));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          if (session?.user) setUser(await fetchUserRow(session.user.id));
          return;
        }
        if (event === 'SIGNED_OUT') { setUser(null); setIsPasswordRecovery(false); return; }
        if (session?.user) setUser(await fetchUserRow(session.user.id));
        else               setUser(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── auth actions ─────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(extractMessage(error));
  };

  /**
   * Creates the Supabase Auth user and passes name/role/company as metadata.
   * A database trigger (handle_new_auth_user) auto-creates the public.users
   * row and the role-specific profile — no client-side inserts needed.
   *
   * Returns { confirmationRequired: true } when the project requires email
   * verification before login (Supabase default). Landing shows a "check
   * your inbox" screen in that case.
   */
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

    // session is null when email confirmation is required
    return { confirmationRequired: !data.session };
  };

  const logout = async () => { await supabase.auth.signOut(); };

  /** Always "succeeds" from the user's perspective — prevents email enumeration. */
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
