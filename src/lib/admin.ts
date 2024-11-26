import { supabase } from "@/integrations/supabase/client";

export async function createAdminUser() {
  const { data, error } = await supabase.functions.invoke('create-admin-user')
  
  if (error) {
    throw new Error(`Failed to create admin user: ${error.message}`)
  }
  
  return data
}