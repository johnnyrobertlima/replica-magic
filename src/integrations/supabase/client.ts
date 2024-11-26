import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/config/env';

// Only validate in production to allow development without env vars
if (import.meta.env.PROD && (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY)) {
  console.error('Supabase configuration is incomplete in production. Please check your deployment configuration.');
  throw new Error('Supabase URL and Anon Key are required');
}

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);