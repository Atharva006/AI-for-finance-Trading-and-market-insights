import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface AuthUserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider?: string;
  role?: 'admin' | 'quant' | 'user';
}

const LOCAL_USER_STORAGE_KEY = 'apex_quant_auth_user';

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
    } else {
      localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to update local user storage:', err);
  }
};

export async function signInWithGoogle() {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    return data;
  }

  // Fallback demo auth for local / preview environments without Supabase keys
  const simulatedUser: AuthUserProfile = {
    id: 'demo-google-user-' + Date.now(),
    email: 'quant.analyst@apexresearch.io',
    name: 'Quantitative Analyst',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    provider: 'google',
    role: 'quant',
  };
  setStoredLocalUser(simulatedUser);
  return { user: simulatedUser };
}

export async function signInWithEmail(email: string, password: string) {
  const cleanEmail = (email || '').trim();
  const cleanPass = (password || '').trim();

  // Support direct administrator login: username "admin" / password "admin"
  const isAdminUser =
    cleanEmail.toLowerCase() === 'admin' ||
    cleanEmail.toLowerCase() === 'admin@apexquant.io' ||
    cleanEmail.toLowerCase() === 'admin@admin.com';

  if (isAdminUser) {
    if (cleanPass === 'admin') {
      const adminUser: AuthUserProfile = {
        id: 'admin-super-user-001',
        email: 'admin@apexquant.io',
        name: 'System Administrator',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
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
      setStoredLocalUser({
        id: data.user.id,
        email: data.user.email || cleanEmail,
        name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        provider: 'email',
        role: 'quant',
      });
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
