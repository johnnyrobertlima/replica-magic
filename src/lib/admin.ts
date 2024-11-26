import { supabase } from "@/integrations/supabase/client";

export const createAdminUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Only proceed if no user is logged in
  if (!user) {
    try {
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
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response from server:', data);
        return { 
          error: {
            message: data.error || 'Failed to create admin user',
            details: data.details
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return { 
        error: {
          message: 'Failed to create admin user',
          details: error.message
        }
      };
    }
  }
  
  return { message: 'User already logged in' };
};