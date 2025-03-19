
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Request, RequestStatus } from "../types";

export function useRequestsFetching() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const { toast } = useToast();

  const fetchRequests = async (page = currentPage) => {
    try {
      setIsLoading(true);
      
      // Calculate pagination range
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Get count first
      const { count, error: countError } = await supabase
        .from('user_requests_view') // Use our view instead of direct table access
        .select('id', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Count error:", countError);
        throw countError;
      } else {
        setTotalCount(count || 0);
      }
      
      // Then fetch the actual data with pagination
      const { data, error } = await supabase
        .from('user_requests_view') // Use our view instead of direct table access
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) {
        // If there's an infinite recursion error, handle it
        if (error.code === '42P17') {
          throw new Error("Erro de política de segurança. Contate o suporte técnico.");
        }
        throw error;
      }
      
      // Cast the string status to RequestStatus type
      setRequests((data || []).map(item => ({
        ...item,
        status: item.status as RequestStatus
      })));
      
      // Update current page
      setCurrentPage(page);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Erro ao carregar solicitações",
        description: error.message || "Não foi possível carregar as solicitações.",
        variant: "destructive",
      });
    } finally { 
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchRequests(newPage);
    }
  };

  return {
    requests,
    setRequests,
    isLoading,
    fetchRequests,
    currentPage,
    totalPages,
    handlePageChange
  };
}
