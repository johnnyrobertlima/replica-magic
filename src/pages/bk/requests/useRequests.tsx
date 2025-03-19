
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
      
      // Use a direct query with the RLS policy instead of the RPC function
      // This avoids the TypeScript error with the function name
      const { data, error } = await supabase
        .from('bk_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
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
