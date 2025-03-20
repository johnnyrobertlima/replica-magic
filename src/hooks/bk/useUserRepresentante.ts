
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
        
        // Instead of querying user_groups directly, use a more direct approach
        // First get all groups
        const { data: groups, error: groupsError } = await supabase
          .from('groups')
          .select('id, name')
          .eq('name', 'Representantes BK')
          .single();
          
        if (groupsError) {
          console.error("Error fetching Representantes BK group:", groupsError);
          setError("Erro ao buscar grupo de representantes");
          setIsLoading(false);
          return;
        }
        
        if (!groups) {
          console.log("Representantes BK group not found");
          setIsLoading(false);
          return;
        }
        
        // Now check if user belongs to this group
        const representanteGroupId = groups.id;
        const { data: userInGroup, error: userInGroupError } = await supabase
          .from('user_groups')
          .select('*')
          .eq('user_id', user.id)
          .eq('group_id', representanteGroupId)
          .maybeSingle();
          
        if (userInGroupError) {
          console.error("Error checking if user is in Representantes BK group:", userInGroupError);
          setError("Erro ao verificar associação do usuário ao grupo de representantes");
          setIsLoading(false);
          return;
        }
        
        const isRepresentante = !!userInGroup;
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
