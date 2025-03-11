
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const BluebayHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate("/client-area/login");
      } else {
        const { data: userData, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user data:", error);
          navigate("/client-area/login");
          return;
        }

        const { data: userGroup } = await supabase.rpc("get_user_group_homepage", {
          user_id_param: data.session.user.id,
        });

        if (userGroup) {
          navigate(userGroup);
        } else {
          navigate("/client-area/bluebay/jab-orders-by-client");
        }
      }
    };

    checkSession();
  }, [navigate]);

  return null;
};

export default BluebayHome;
