
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Request, RequestStatus } from "../types";
import { getStorageUrl } from "@/utils/imageUtils";

export function useRequestOperations(
  requests: Request[],
  setRequests: React.Dispatch<React.SetStateAction<Request[]>>
) {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [response, setResponse] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const { toast } = useToast();

  const handleResponseSubmit = async () => {
    if (!selectedRequest || !response.trim()) {
      toast({
        title: "Erro",
        description: "Selecione uma solicitação e escreva uma resposta",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingStatus(true);
      
      // Update the request with the response and change status to "Respondido"
      const { data, error } = await supabase
        .from('bk_requests')
        .update({ 
          response: response,
          status: 'Respondido' as RequestStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const updatedRequest = {
          ...data[0],
          attachment_url: data[0].attachment_url ? getStorageUrl(data[0].attachment_url) : null
        };
        
        // Update the local state
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === selectedRequest.id 
              ? { ...req, response, status: 'Respondido', updated_at: new Date().toISOString() } 
              : req
          )
        );
        
        // Update the selected request
        setSelectedRequest({ ...selectedRequest, response, status: 'Respondido', updated_at: new Date().toISOString() });
        
        toast({
          title: "Resposta enviada",
          description: `Resposta para o protocolo ${selectedRequest.protocol} enviada com sucesso`,
          variant: "default",
        });
        
        // Clear the response field
        setResponse("");
      }
    } catch (error: any) {
      console.error("Error submitting response:", error);
      toast({
        title: "Erro ao enviar resposta",
        description: error.message || "Não foi possível enviar a resposta",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateRequestStatus = async (newStatus: RequestStatus) => {
    if (!selectedRequest) {
      toast({
        title: "Erro",
        description: "Selecione uma solicitação para atualizar o status",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingStatus(true);
      
      // Update the request status
      const { data, error } = await supabase
        .from('bk_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const updatedRequest = {
          ...data[0],
          attachment_url: data[0].attachment_url ? getStorageUrl(data[0].attachment_url) : null
        };
        
        // Update the local state
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === selectedRequest.id 
              ? { ...req, status: newStatus, updated_at: new Date().toISOString() } 
              : req
          )
        );
        
        // Update the selected request
        setSelectedRequest({ ...selectedRequest, status: newStatus, updated_at: new Date().toISOString() });
        
        toast({
          title: "Status atualizado",
          description: `Status da solicitação ${selectedRequest.protocol} atualizado para ${newStatus}`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Não foi possível atualizar o status",
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
