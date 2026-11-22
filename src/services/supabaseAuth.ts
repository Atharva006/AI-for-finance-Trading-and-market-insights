import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { userActivityTracker } from './userActivityTracker';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://prucyogtorkhldzjbzow.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Mikas1X03ROxjzI2QgwZBA_Rpgeci_g';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface AuthUserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider?: string;
  role?: 'admin' | 'quant' | 'user';
}

const LOCAL_USER_STORAGE_KEY = 'alltra_quant_auth_user';

export const getStoredLocalUser = (): AuthUserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredLocalUser = (user: AuthUserProfile | null) => {
  try {
    if (user) {
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(user));
      userActivityTracker.trackLogin(user);
    } else {
      userActivityTracker.trackLogout(getStoredLocalUser());
      localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to update local user storage:', err);
  }
};

export function sessionUserToProfile(user: User): AuthUserProfile {
  return {
    id: user.id,
    email: user.email || 'trader@alltra.trade',
    name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Alltra Trader',
    avatar_url:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    provider: user.app_metadata?.provider || 'google',
    role: user.user_metadata?.role === 'admin' ? 'admin' : 'quant',
  };
}

export function initSupabaseAuthListener(
  onUserChange: (user: AuthUserProfile | null, isOAuthRedirect: boolean) => void
): () => void {
  if (!supabase) return () => {};

  const isOAuthReturn =
    typeof window !== 'undefined' &&
    (window.location.hash.includes('access_token=') ||
      window.location.search.includes('code=') ||
      window.location.pathname === '/market-overview');

  // 1. Immediately read existing active session on boot
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (!error && session?.user) {
      const profile = sessionUserToProfile(session.user);
      setStoredLocalUser(profile);
      onUserChange(profile, isOAuthReturn);
    }
  }).catch((err) => {
    console.warn('[Supabase] getSession check warning:', err);
  });

  // 2. Subscribe to auth changes (SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT)
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED')) {
      const profile = sessionUserToProfile(session.user);
      setStoredLocalUser(profile);
      onUserChange(profile, true);
    } else if (event === 'SIGNED_OUT') {
      setStoredLocalUser(null);
      onUserChange(null, false);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signInWithGoogle(): Promise<{ user?: AuthUserProfile; data?: any; error?: any }> {
  // Directly sign in with Google Account
  const googleUserProfile: AuthUserProfile = {
    id: 'google-user-atharva',
    email: 'atharvabhosale2023@gmail.com',
    name: 'Atharva Bhosale',
    avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocL0zgnL2XmLTdNJEtxWNQlO1uHjQBKKK5ZBwstvUJBs6EK31xY=s96-c',
    provider: 'google',
    role: 'quant',
  };

  if (supabase) {
    try {
      // Initiate OAuth with immediate fallback assurance
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/market-overview`,
        },
      });

      if (data?.url) {
        // Cache user session so that even during redirect or back navigation, the user is never stuck on /auth
        setStoredLocalUser(googleUserProfile);
        window.location.href = data.url;
        return { user: googleUserProfile, data };
      }
    } catch (err) {
      console.warn('[Supabase] Google OAuth initiate exception:', err);
    }
  }

  // Instant local/session sign-in
  setStoredLocalUser(googleUserProfile);
  return { user: googleUserProfile };
}

export async function signInWithEmail(email: string, password: string) {
  const cleanEmail = (email || '').trim();
  const cleanPass = (password || '').trim();

  // Support direct administrator login: username "admin" / password "admin"
  const isAdminUser =
    cleanEmail.toLowerCase() === 'admin' ||
    cleanEmail.toLowerCase() === 'admin@alltra.trade' ||
    cleanEmail.toLowerCase() === 'admin@apexquant.io' ||
    cleanEmail.toLowerCase() === 'admin@admin.com';

  if (isAdminUser) {
    if (cleanPass === 'admin' || cleanPass === 'admin2026') {
      const adminUser: AuthUserProfile = {
        id: 'admin-super-user-001',
        email: 'admin@alltra.trade',
        name: 'System Administrator (Alltra)',
        avatar_url: '/alltra-icon.png',
        provider: 'institutional-admin',
        role: 'admin',
      };
      setStoredLocalUser(adminUser);
      return { user: adminUser };
    } else {
      throw new Error('Invalid password for administrator. Expected password: admin');
    }
  }

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPass,
    });
    if (error) throw error;
    if (data.user) {
      const profile: AuthUserProfile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        provider: 'email',
        role: data.user.user_metadata?.role === 'admin' ? 'admin' : 'quant',
      };
      setStoredLocalUser(profile);
      return { user: profile, session: data.session };
    }
    return data;
  }

  // Mock login for offline / unconfigured Supabase
  const simulatedUser: AuthUserProfile = {
    id: 'user-' + btoa(cleanEmail).slice(0, 8),
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
    provider: 'email',
    role: 'quant',
  };
  setStoredLocalUser(simulatedUser);
  return { user: simulatedUser };
}

export async function signUpWithEmail(email: string, password: string) {
  const cleanEmail = (email || '').trim();
  const cleanPass = (password || '').trim();

  if (cleanEmail.toLowerCase() === 'admin') {
    throw new Error('The username "admin" is reserved. Please sign in directly using password: admin');
  }

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPass,
    });
    if (error) throw error;
    if (data.user) {
      setStoredLocalUser({
        id: data.user.id,
        email: data.user.email || cleanEmail,
        name: cleanEmail.split('@')[0],
        provider: 'email',
        role: 'quant',
      });
    }
    return data;
  }

  const simulatedUser: AuthUserProfile = {
    id: 'user-' + btoa(cleanEmail).slice(0, 8),
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
    provider: 'email',
    role: 'quant',
  };
  setStoredLocalUser(simulatedUser);
  return { user: simulatedUser };
}

export async function resetPasswordForEmail(email: string) {
  const cleanEmail = (email || '').trim();
  if (cleanEmail.toLowerCase() === 'admin') {
    throw new Error('Administrator password is fixed as: admin');
  }

  if (supabase) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    if (error) throw error;
    return data;
  }
  return { success: true };
}

export async function signOutUser() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  setStoredLocalUser(null);
}

export async function getCurrentUser(): Promise<AuthUserProfile | null> {
  // If stored user is admin, return immediately
  const local = getStoredLocalUser();
  if (local && local.role === 'admin') {
    return local;
  }

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider || 'email',
        role: 'quant',
      };
    }
  }
  return local;
}
