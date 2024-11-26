import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/config/env';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key are required');
}

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);