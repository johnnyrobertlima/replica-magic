
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Request, RequestStatus } from "./types";

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserRequests = async () => {
    try {
      setIsLoading(true);
      
      // First get the current user's ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para visualizar suas solicitações.",
          variant: "destructive",
        });
        return;
      }
      
      // Use the security definer function to fetch requests
      // This avoids the infinite recursion in RLS policies
      const { data, error } = await supabase
        .rpc('get_user_requests', { user_id_param: session.user.id });
      
      if (error) throw error;
      
      // Cast the status to the RequestStatus type
      setRequests((data || []).map(item => ({
        ...item,
        status: item.status as RequestStatus
      })));
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Erro ao carregar solicitações",
        description: error.message || "Não foi possível carregar suas solicitações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load requests on initial render
  useEffect(() => {
    fetchUserRequests();
  }, []);

  return {
    requests,
    isLoading,
    fetchUserRequests
  };
}
