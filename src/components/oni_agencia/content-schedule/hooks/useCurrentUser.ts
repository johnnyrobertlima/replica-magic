
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCurrentUser() {
  const [userName, setUserName] = useState("Usuário");
  
  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to get user profile data with name
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
          
        if (profileData?.full_name) {
          setUserName(profileData.full_name);
        } else if (profileData?.email) {
          setUserName(profileData.email);
        } else if (user.email) {
          setUserName(user.email);
        }
      }
    }
    
    getUserData();
  }, []);
  
  return userName;
}
