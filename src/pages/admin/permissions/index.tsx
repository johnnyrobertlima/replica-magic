
import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { GroupSelector } from "./components/GroupSelector";
import { PermissionManager } from "./PermissionManager";
import { supabase } from "@/integrations/supabase/client";

export const AdminPermissions = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          toast.error("Você precisa estar logado para acessar esta página");
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase.rpc('check_admin_permission', {
          check_user_id: session.session.user.id
        });
        
        if (error) {
          console.error("Erro ao verificar permissões de admin:", error);
          toast.error("Erro ao verificar permissões");
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
        toast.error("Erro ao verificar permissões");
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Log the state changes for debugging
  useEffect(() => {
    console.log("Selected group ID changed:", selectedGroupId);
  }, [selectedGroupId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Gerenciamento de Permissões</h1>
      </div>

      <div className="grid gap-6">
        <GroupSelector 
          selectedGroupId={selectedGroupId}
          onGroupChange={setSelectedGroupId}
        />

        {selectedGroupId && (
          <PermissionManager selectedGroupId={selectedGroupId} />
        )}
      </div>
    </div>
  );
};

export default AdminPermissions;
