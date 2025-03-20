
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Representante } from "@/types/representante";

export const useUserRepresentante = () => {
  const [isRepresentanteBK, setIsRepresentanteBK] = useState(false);
  const [representanteCodigo, setRepresentanteCodigo] = useState<number | null>(null);
  const [representanteNome, setRepresentanteNome] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserGroupAndRepresentante = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        // Check if user is in the "Representantes BK" group
        const { data: userGroups } = await supabase
          .from('user_groups')
          .select('group_id')
          .eq('user_id', user.id);
          
        if (!userGroups || userGroups.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Get the group IDs to check if any is "Representantes BK"
        const groupIds = userGroups.map(ug => ug.group_id);
        
        const { data: groups } = await supabase
          .from('groups')
          .select('id, name')
          .in('id', groupIds);
          
        const isRepresentante = groups?.some(group => group.name === 'Representantes BK') || false;
        setIsRepresentanteBK(isRepresentante);
        
        if (isRepresentante && user) {
          // Get the representante code for this user
          const { data: userRepresentante } = await supabase
            .from('user_representantes')
            .select('codigo_representante')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (userRepresentante) {
            setRepresentanteCodigo(userRepresentante.codigo_representante);
            
            // Get the representative's name
            const { data: representanteData } = await supabase
              .from('vw_representantes')
              .select('nome_representante')
              .eq('codigo_representante', userRepresentante.codigo_representante)
              .maybeSingle();
              
            if (representanteData) {
              setRepresentanteNome(representanteData.nome_representante);
            }
          }
        }
      } catch (error) {
        console.error("Error checking user group and representante:", error);
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
    isLoading
  };
};
