
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCurrentUser() {
  const [userName, setUserName] = useState<string>("Usuário");
  
  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.email || "Usuário");
      }
    };
    
    getUserInfo();
  }, []);
  
  return userName;
}
