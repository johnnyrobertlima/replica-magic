import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const showDetailedError = (error: any) => {
  const details = JSON.stringify(error, null, 2);
  toast("Detailed Error Log", {
    description: (
      <div className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        <code className="text-white text-xs whitespace-pre-wrap">{details}</code>
      </div>
    ),
    duration: 10000,
  });
};

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
        const errorMessage = response.error.message || 'Failed to create admin user';
        toast.error(errorMessage, {
          description: "Click here to see detailed error log",
          action: {
            label: "View Details",
            onClick: () => showDetailedError(response.error)
          }
        });
        return { 
          error: {
            message: errorMessage,
            details: response.error.details || 'No additional details available'
          }
        };
      }

      if (response.data.error) {
        console.error('Error in response data:', response.data.error);
        const errorMessage = response.data.error;
        toast.error(errorMessage, {
          description: "Click here to see detailed error log",
          action: {
            label: "View Details",
            onClick: () => showDetailedError(response.data)
          }
        });
        return {
          error: {
            message: errorMessage,
            details: response.data.details || 'No additional details available'
          }
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error creating admin user:', error);
      const errorMessage = 'Failed to create admin user';
      toast.error(errorMessage, {
        description: "Click here to see detailed error log",
        action: {
          label: "View Details",
          onClick: () => showDetailedError(error)
        }
      });
      return { 
        error: {
          message: errorMessage,
          details: error.message || 'No additional details available'
        }
      };
    }
  }
  
  return { message: 'User already logged in' };
};