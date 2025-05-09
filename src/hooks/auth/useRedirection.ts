
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useRedirection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Function to get user group homepage using RPC
  const getUserGroupHomepage = async (userId: string) => {
    try {
      console.log("Buscando homepage do grupo para usuário:", userId);
      
      const { data, error } = await supabase.rpc('get_user_group_homepage', {
        user_id_param: userId
      });
      
      if (error) {
        console.error("Erro ao chamar RPC:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Erro ao buscar homepage do grupo:", error);
      return null;
    }
  };

  const handleRedirect = async (userId: string) => {
    try {
      console.log("Iniciando redirecionamento para usuário:", userId);
      
      // Try to get the user group homepage
      const homepage = await getUserGroupHomepage(userId);
      
      if (homepage && typeof homepage === 'string') {
        console.log("Homepage encontrada:", homepage);
        // Remove initial slash if it exists to avoid routing problems
        const normalizedHomepage = homepage.startsWith('/') ? homepage.slice(1) : homepage;
        console.log("Redirecionando para:", normalizedHomepage);
        
        navigate(`/${normalizedHomepage}`);
        return true;
      }
      
      // If we got here, no specific homepage was found
      console.log("Nenhuma homepage específica encontrada, redirecionando para a área padrão");
      navigate("/client-area");
      return true;
      
    } catch (error: any) {
      console.error("Erro ao verificar redirecionamento:", error);
      toast({
        title: "Erro ao verificar permissões",
        description: error.message,
        variant: "destructive",
      });
      // Default redirect in case of error
      navigate("/client-area");
      return false;
    }
  };

  return {
    handleRedirect
  };
};
