import { supabase } from "@/integrations/supabase/client";

export const createAdminUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Only proceed if no user is logged in
  if (!user) {
    try {
      const response = await supabase.functions.invoke('create-admin-user', {
        method: 'POST',
      });

      if (response.error) {
        console.error('Error response from server:', response.error);
        return { 
          error: {
            message: response.error.message || 'Failed to create admin user',
            details: response.error.details || 'No additional details available'
          }
        };
      }

      if (response.data.error) {
        console.error('Error in response data:', response.data.error);
        return {
          error: {
            message: response.data.error,
            details: response.data.details || 'No additional details available'
          }
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return { 
        error: {
          message: 'Failed to create admin user',
          details: error.message || 'No additional details available'
        }
      };
    }
  }
  
  return { message: 'User already logged in' };
};