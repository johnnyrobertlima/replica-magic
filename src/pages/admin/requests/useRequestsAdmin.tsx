
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Request, RequestStatus } from "./types";

export function useRequestsAdmin() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [response, setResponse] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();
  
  // Extract unique departments from requests for filter
  const departments = Array.from(new Set(requests.map(req => req.department))).sort();

  // Fetch all requests
  useEffect(() => {
    fetchRequests();
  }, []);
  
  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [requests, searchTerm, statusFilter, departmentFilter, activeTab]);
  
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('bk_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast the string status to RequestStatus type
      setRequests((data || []).map(item => ({
        ...item,
        status: item.status as RequestStatus
      })));
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
  
  const applyFilters = () => {
    let result = [...requests];
    
    // Filter by tab (request status group)
    if (activeTab === "open") {
      result = result.filter(req => 
        ["Aberto", "Em Análise", "Em Andamento"].includes(req.status)
      );
    } else if (activeTab === "closed") {
      result = result.filter(req => 
        ["Concluído", "Cancelado"].includes(req.status)
      );
    } else if (activeTab === "responded") {
      result = result.filter(req => 
        req.status === "Respondido"
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(req => req.status === statusFilter);
    }
    
    // Apply department filter
    if (departmentFilter) {
      result = result.filter(req => req.department === departmentFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(req => 
        req.title.toLowerCase().includes(lowerSearchTerm) ||
        req.description.toLowerCase().includes(lowerSearchTerm) ||
        req.protocol.toLowerCase().includes(lowerSearchTerm) ||
        req.user_email.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setFilteredRequests(result);
  };
  
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

  const clearFilters = () => {
    setStatusFilter("");
    setDepartmentFilter("");
    setSearchTerm("");
  };

  return {
    requests,
    filteredRequests,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    departmentFilter,
    setDepartmentFilter,
    activeTab,
    setActiveTab,
    selectedRequest,
    setSelectedRequest,
    response,
    setResponse,
    updatingStatus,
    departments,
    fetchRequests,
    handleResponseSubmit,
    updateRequestStatus,
    clearFilters
  };
}
