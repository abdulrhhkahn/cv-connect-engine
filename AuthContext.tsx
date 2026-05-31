import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user:    User | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<void>;
  signup:  (name: string, email: string, password: string, role: UserRole, company?: string) => Promise<void>;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ── Helpers ─────────────────────────────────────────────────────

async function fetchUserRow(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, company')
    .eq('id', id)
    .maybeSingle();          // returns null instead of error when no row found
  if (error) { console.error('fetchUserRow', error); return null; }
  if (!data) return null;
  return {
    id:      data.id,
    email:   data.email,
    name:    data.name,
    role:    data.role as UserRole,
    company: data.company ?? undefined,
  };
}

/**
 * Called after a first-time OAuth sign-in (e.g. LinkedIn).
 * Supabase handles the auth.users row — we seed our public.users + profile.
 */
async function seedOAuthUser(authUser: { id: string; email?: string; user_metadata: Record<string, string> }): Promise<void> {
  const name  = authUser.user_metadata?.full_name
    || authUser.user_metadata?.name
    || authUser.email?.split('@')[0]
    || 'User';
  const email = authUser.email ?? '';

  // Users row (ignore if already exists from a prior seed attempt)
  const { error: userErr } = await supabase
    .from('users')
    .insert({ id: authUser.id, email, name, role: 'candidate', company: null });
  // 23505 = unique_violation; safe to ignore — means a concurrent seed already ran
  if (userErr && userErr.code !== '23505') {
    console.error('seedOAuthUser users insert', userErr);
    return;
  }

  // Candidate profile
  const { error: profileErr } = await supabase
    .from('candidate_profiles')
    .insert({
      user_id:             authUser.id,
      name,
      email,
      title:               '',
      summary:             '',
      skills:              [],
      experience:          '',
      education:           '',
      cv_url:              null,
      cv_file_name:        null,
      avatar_url:          null,
      phone:               null,
      linked_in:           null,
      portfolio:           null,
      location:            null,
      industry_experience: [],
      soft_skills:         [],
      cultural_fit:        [],
    });
  if (profileErr && profileErr.code !== '23505') {
    console.error('seedOAuthUser profile insert', profileErr);
  }
}

// ── Provider ────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        let u = await fetchUserRow(session.user.id);
        // First-time OAuth sign-in — no public.users row yet
        if (!u) {
          await seedOAuthUser({
            id:            session.user.id,
            email:         session.user.email,
            user_metadata: session.user.user_metadata ?? {},
          });
          u = await fetchUserRow(session.user.id);
        }
        setUser(u);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          let u = await fetchUserRow(session.user.id);
          // Seed on SIGNED_IN so OAuth first-timers are covered when the
          // browser redirects back from LinkedIn
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
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth actions ─────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange fires → setUser is called there
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    company?: string,
  ) => {
    // 1 ─ Create the Supabase Auth user
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError || !data.user) throw signUpError ?? new Error('Sign-up failed');

    const uid = data.user.id;

    // 2 ─ Insert the public user row
    const { error: userError } = await supabase.from('users').insert({
      id:      uid,
      email,
      name,
      role,
      company: role === 'company' ? (company ?? '') : null,
    });
    if (userError) throw userError;

    // 3 ─ Seed role-specific profile
    if (role === 'candidate') {
      const { error } = await supabase.from('candidate_profiles').insert({
        user_id:             uid,
        name,
        email,
        title:               '',
        summary:             '',
        skills:              [],
        experience:          '',
        education:           '',
        cv_url:              null,
        cv_file_name:        null,
        avatar_url:          null,
        phone:               null,
        linked_in:           null,
        portfolio:           null,
        location:            null,
        industry_experience: [],
        soft_skills:         [],
        cultural_fit:        [],
      });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('company_profiles').insert({
        user_id:       uid,
        company_name:  company ?? name,
        about:         '',
        industry:      '',
        location:      '',
        size:          '',
        website:       '',
        contact_email: email,
        contact_phone: '',
        logo_url:      null,
        banner_url:    null,
        employees:     [],
        followers:     [],
      });
      if (error) throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
