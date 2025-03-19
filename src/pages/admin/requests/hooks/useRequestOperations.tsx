
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Request, RequestStatus } from "../types";

export function useRequestOperations(requests: Request[], setRequests: React.Dispatch<React.SetStateAction<Request[]>>) {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [response, setResponse] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();
  
  const handleResponseSubmit = async () => {
    if (!selectedRequest || !response.trim()) return;
    
    try {
      setUpdatingStatus(true);
      
      // Update the request with response
      const { error } = await supabase
        .from('bk_requests')
        .update({ 
          response: response,
          status: "Respondido",
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);
      
      if (error) throw error;
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, response, status: "Respondido", updated_at: new Date().toISOString() } 
            : req
        )
      );
      
      // Update selected request to show the new response and status
      setSelectedRequest(prev => 
        prev ? { ...prev, response, status: "Respondido", updated_at: new Date().toISOString() } : null
      );
      
      // Reset response form
      setResponse("");
      
      toast({
        title: "Resposta enviada com sucesso",
        description: `Resposta adicionada ao protocolo ${selectedRequest.protocol}`,
        variant: "default",
      });
      
    } catch (error: any) {
      console.error("Error submitting response:", error);
      toast({
        title: "Erro ao enviar resposta",
        description: error.message || "Não foi possível enviar a resposta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const updateRequestStatus = async (requestId: string, newStatus: RequestStatus) => {
    try {
      setUpdatingStatus(true);
      
      // Update the request status
      const { error } = await supabase
        .from('bk_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus, updated_at: new Date().toISOString() } 
            : req
        )
      );
      
      // Update selected request if it's the one being updated
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status: newStatus, updated_at: new Date().toISOString() } : null);
      }
      
      toast({
        title: "Status atualizado",
        description: `O status da solicitação foi alterado para ${newStatus}`,
        variant: "default",
      });
      
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  return {
    selectedRequest,
    setSelectedRequest,
    response,
    setResponse,
    updatingStatus,
    handleResponseSubmit,
    updateRequestStatus
  };
}
