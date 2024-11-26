const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (import.meta.env.DEV) {
      console.warn(`Environment variable ${key} is not set in development mode. Using fallback value.`);
      // Return development fallback values
      if (key === 'VITE_SUPABASE_URL') {
        return 'https://iaegdxxxlastfujboajm.supabase.co';
      }
      if (key === 'VITE_SUPABASE_ANON_KEY') {
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
      }
    }
    return '';
  }
  return value;
};

export const env = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
};

// Only throw errors in production
if (import.meta.env.PROD) {
  if (!env.SUPABASE_URL) {
    console.error('Missing VITE_SUPABASE_URL environment variable in production. Please check your deployment configuration.');
    throw new Error('VITE_SUPABASE_URL environment variable is required');
  }

  if (!env.SUPABASE_ANON_KEY) {
    console.error('Missing VITE_SUPABASE_ANON_KEY environment variable in production. Please check your deployment configuration.');
    throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required');
  }
}