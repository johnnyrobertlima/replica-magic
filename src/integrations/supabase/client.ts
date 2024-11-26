import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://iaegdxxxlastfujboajm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWdkeHh4bGFzdGZ1amJvYWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0MTE0MjIsImV4cCI6MjA0Njk4NzQyMn0.cgRu9S27kOPJ1wsuY6wUXhrZPLXXbnnv3cGNcEHMMsU";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);