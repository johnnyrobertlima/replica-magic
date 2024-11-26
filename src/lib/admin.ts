import { supabase } from "@/integrations/supabase/client";

export const createAdminUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Only proceed if no user is logged in
  if (!user) {
    const response = await fetch(
      'https://iaegdxxxlastfujboajm.functions.supabase.co/create-admin-user',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating admin user:', errorData);
      return { error: errorData };
    }
    
    return await response.json();
  }
  
  return { message: 'User already logged in' };
};