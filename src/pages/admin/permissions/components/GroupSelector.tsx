
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Group } from "../types";
import { useGetGroups } from "../useGetGroups";

interface GroupSelectorProps {
  selectedGroupId: string;
  onGroupChange: (groupId: string) => void;
}

export const GroupSelector = ({ selectedGroupId, onGroupChange }: GroupSelectorProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [localGroups, setLocalGroups] = useState<Group[]>([]);

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          toast.error("Você precisa estar logado para acessar esta página");
          return;
        }
        
        const { data, error } = await supabase.rpc('check_admin_permission', {
          check_user_id: session.session.user.id
        });
        
        if (error) {
          console.error("Error checking admin status:", error);
          toast.error("Erro ao verificar permissões de administrador");
          return;
        }
        
        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error in admin check:", error);
        toast.error("Erro ao verificar status de administrador");
      }
    };
    
    checkAdminStatus();
  }, []);

  // Usar o hook para buscar grupos
  const { data: groups, isLoading, error } = useGetGroups();

  // Backup: Se o hook principal falhar, tentar uma abordagem alternativa direta
  useEffect(() => {
    if (error && isAdmin) {
      console.log("Fetching groups for GroupSelector");
      const fetchGroups = async () => {
        try {
          // Tentar buscar os grupos diretamente da database
          const { data, error } = await supabase
            .from("groups")
            .select("id, name, description, homepage");
          
          if (error) throw error;
          setLocalGroups(data as Group[]);
        } catch (err) {
          console.error("Error in backup group fetch:", err);
        }
      };
      
      fetchGroups();
    }
  }, [error, isAdmin]);

  // Mostrar estado de carregamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  
  // Se não for admin, mostrar mensagem apropriada
  if (!isAdmin) {
    return (
      <div className="text-amber-500 flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>Apenas administradores podem gerenciar permissões.</span>
      </div>
    );
  }
  
  // Mostrar erro se ocorrer
  if (error && !localGroups.length) {
    return (
      <div className="text-red-500">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5" />
          <span>Erro ao carregar grupos. Por favor, tente novamente.</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Há um problema com as políticas de segurança no banco de dados. 
          Contate o administrador do sistema.
        </p>
      </div>
    );
  }

  // Usar grupos do hook principal ou do backup
  const displayGroups = groups?.length ? groups : localGroups;

  if (!displayGroups || displayGroups.length === 0) {
    return (
      <div className="text-amber-500 flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>Nenhum grupo encontrado. Crie um grupo primeiro.</span>
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
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um grupo" />
        </SelectTrigger>
        <SelectContent>
          {displayGroups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
