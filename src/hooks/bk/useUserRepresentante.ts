
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Representante } from "@/types/representante";

export const useUserRepresentante = () => {
  const [isRepresentanteBK, setIsRepresentanteBK] = useState(false);
  const [representanteCodigo, setRepresentanteCodigo] = useState<number | null>(null);
  const [representanteNome, setRepresentanteNome] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserGroupAndRepresentante = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error fetching user:", userError);
          setError("Erro ao buscar usuário");
          setIsLoading(false);
          return;
        }
        
        if (!user) {
          console.log("No user found");
          setIsLoading(false);
          return;
        }
        
        console.log("Checking if user is in 'Representantes BK' group");
        
        // Use the RPC function to check if user is in the BK Representantes group
        // This avoids the RLS issue with the user_groups table
        const { data: userGroups, error: groupsError } = await supabase.rpc(
          'check_user_in_group',
          { 
            user_id: user.id, 
            group_name: 'Representantes BK'
          }
        );
        
        if (groupsError) {
          console.error("Error checking if user is in Representantes BK group:", groupsError);
          setError("Erro ao verificar associação ao grupo de representantes. Por favor, contate o suporte.");
          setIsLoading(false);
          return;
        }
        
        // userGroups will be true/false or null if the function exists and was executed
        const isRepresentante = !!userGroups;
        console.log("Is user a representante?", isRepresentante);
        setIsRepresentanteBK(isRepresentante);
        
        if (isRepresentante && user) {
          console.log("User is a representante, fetching representative code");
          // Get the representante code for this user
          const { data: userRepresentante, error: repError } = await supabase
            .from('user_representantes')
            .select('codigo_representante')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (repError) {
            console.error("Error fetching user representative code:", repError);
            setError("Erro ao buscar código do representante");
            setIsLoading(false);
            return;
          }
            
          if (userRepresentante) {
            console.log("Representative code found:", userRepresentante.codigo_representante);
            setRepresentanteCodigo(userRepresentante.codigo_representante);
            
            // Get the representative's name
            const { data: representanteData, error: nameError } = await supabase
              .from('vw_representantes')
              .select('nome_representante')
              .eq('codigo_representante', userRepresentante.codigo_representante)
              .maybeSingle();
              
            if (nameError) {
              console.error("Error fetching representative name:", nameError);
              setError("Erro ao buscar nome do representante");
            } else if (representanteData) {
              console.log("Representative name found:", representanteData.nome_representante);
              setRepresentanteNome(representanteData.nome_representante);
            }
          } else {
            console.log("User is in representantes group but has no representative code assigned");
            setError("Usuário está no grupo de representantes mas não tem um código de representante associado");
          }
        }
      } catch (error) {
        console.error("Error checking user group and representante:", error);
        setError("Erro ao verificar grupo e representante do usuário");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserGroupAndRepresentante();
  }, []);
  
  return {
    isRepresentanteBK,
    representanteCodigo,
    representanteNome,
    isLoading,
    error
  };
};
