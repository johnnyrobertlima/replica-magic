import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/config/env';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);