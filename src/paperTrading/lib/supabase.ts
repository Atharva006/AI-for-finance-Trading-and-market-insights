import { createClient } from '@supabase/supabase-js';

// Canonical Supabase project configuration
const DEFAULT_SUPABASE_URL = 'https://prucyogtorkhldzjbzow.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydWN5b2d0b3JraGxkempYem93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzMjkwMDAsImV4cCI6MjExMDg5MDAwMH0.supabase-anon-auth-token';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl !== 'https://your-project-ref.supabase.co' &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('lmmbjwvytqdcxifgjwsi') // Dead endpoint without migrated schema
);

export const supabase = createClient(rawUrl, rawKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

