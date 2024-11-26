export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

if (!env.SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL environment variable is required');
}

if (!env.SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required');
}