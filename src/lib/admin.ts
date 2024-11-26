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
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWdkeHh4bGFzdGZ1amJvYWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0MTE0MjIsImV4cCI6MjA0Njk4NzQyMn0.cgRu9S27kOPJ1wsuY6wUXhrZPLXXbnnv3cGNcEHMMsU`,
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