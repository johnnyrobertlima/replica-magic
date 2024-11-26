import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/config/env';

// Validate environment variables before creating the client
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.error('Supabase configuration is incomplete. Please check your environment variables.');
  throw new Error('Supabase URL and Anon Key are required');
}

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);