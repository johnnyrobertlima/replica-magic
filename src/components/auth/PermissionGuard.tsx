
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PermissionGuardProps {
  children: React.ReactNode;
  resourcePath: string;
  requiredPermission?: 'read' | 'write' | 'admin';
}

export const PermissionGuard = ({
  children,
  resourcePath,
  requiredPermission = 'read'
}: PermissionGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          navigate('/admin/login');
          return;
        }

        // Verifica se o usuário tem a permissão necessária
        const { data, error } = await supabase.rpc('check_user_permission', {
          user_id: session.user.id,
          resource_path: resourcePath,
          required_permission: requiredPermission
        });

        if (error) throw error;

        setHasPermission(data);
        setIsLoading(false);

        if (!data) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta página.",
            variant: "destructive",
          });
          navigate('/admin');
        }

      } catch (error: any) {
        console.error('Erro ao verificar permissões:', error);
        toast({
          title: "Erro ao verificar permissões",
          description: error.message,
          variant: "destructive",
        });
        navigate('/admin');
      }
    };

    checkPermission();
  }, [resourcePath, requiredPermission, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
};
