const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (value === undefined) {
    console.warn(`Environment variable ${key} is not set. Using fallback value.`);
    return '';
  }
  return value;
};

export const env = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
};

// Still validate the required variables, but with more helpful messages
if (!env.SUPABASE_URL) {
  console.error('Missing VITE_SUPABASE_URL environment variable. Please check your .env file.');
  throw new Error('VITE_SUPABASE_URL environment variable is required');
}

if (!env.SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.');
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required');
}