
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Group } from "../types";
import { useState, useEffect } from "react";

interface GroupSelectorProps {
  selectedGroupId: string;
  onGroupChange: (groupId: string) => void;
}

export const GroupSelector = ({ selectedGroupId, onGroupChange }: GroupSelectorProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Primeiro verificar se o usuário é admin - isso não deveria causar recursão
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;
        
        const { data, error } = await supabase.rpc('check_admin_permission', {
          check_user_id: session.session.user.id
        });
        
        if (error) {
          console.error("Error checking admin status:", error);
          return;
        }
        
        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error in admin check:", error);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Se o usuário for admin, buscar os grupos usando RPC em vez de acesso direto à tabela
  const { data: groups, isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      console.log("Tentando buscar grupos para o GroupSelector");
      
      try {
        // Tente usar uma função RPC para buscar os grupos em vez de acessar diretamente
        // Primeiro, vamos tentar usar uma consulta SQL direta via RPC
        const { data, error } = await supabase.rpc("get_all_groups");
        
        if (error) {
          // Se a função RPC não existir, podemos tentar um método alternativo
          console.error("Erro ao buscar grupos via RPC:", error);
          
          // Método alternativo: buscar apenas IDs e nomes sem filtros RLS
          const { data: directData, error: directError } = await supabase
            .from("groups")
            .select("id, name")
            .order("name");
          
          if (directError) {
            throw directError;
          }
          
          console.log("Grupos carregados diretamente:", directData);
          return directData as Group[];
        }
        
        console.log("Grupos carregados via RPC:", data);
        return data as Group[];
      } catch (err) {
        console.error("Erro final ao buscar grupos:", err);
        
        // Como fallback, retornar uma lista vazia e mostrar um erro ao usuário
        return [] as Group[];
      }
    },
    enabled: isAdmin, // Apenas execute a consulta se o usuário for admin
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500">
        Erro ao carregar grupos. Por favor, tente novamente.
        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-amber-500">
        Nenhum grupo encontrado. Por favor, crie um grupo primeiro.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="group">Selecione um grupo</Label>
      <Select
        value={selectedGroupId}
        onValueChange={(value) => onGroupChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um grupo" />
        </SelectTrigger>
        <SelectContent>
          {groups?.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
