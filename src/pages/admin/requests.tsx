
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertCircle, 
  CheckCircle, 
  FileUp, 
  Filter, 
  Loader2, 
  RefreshCw, 
  Search, 
  X 
} from "lucide-react";
import { format } from "date-fns";

// Request status with corresponding badge colors
const REQUEST_STATUS = {
  "Aberto": "default",
  "Em Análise": "warning",
  "Em Andamento": "secondary",
  "Respondido": "info",
  "Concluído": "success",
  "Cancelado": "destructive"
};

interface Request {
  id: string;
  protocol: string;
  title: string;
  department: string;
  description: string;
  status: keyof typeof REQUEST_STATUS;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_email: string;
  attachment_url?: string;
  response?: string;
}

const AdminRequests = () => {
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
      
      setRequests(data || []);
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
  
  const updateRequestStatus = async (requestId: string, newStatus: keyof typeof REQUEST_STATUS) => {
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
  
  const getBadgeVariant = (status: keyof typeof REQUEST_STATUS) => {
    return REQUEST_STATUS[status] as "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
  };
  
  // Extract unique departments from requests for filter
  const departments = Array.from(new Set(requests.map(req => req.department))).sort();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Solicitações</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main section with filters and request list */}
        <div className="lg:col-span-7">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Solicitações</CardTitle>
                  <CardDescription>
                    Gerencie as solicitações dos usuários
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchRequests}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Tabs for high-level filtering */}
              <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="open">Em Aberto</TabsTrigger>
                  <TabsTrigger value="responded">Respondidas</TabsTrigger>
                  <TabsTrigger value="closed">Concluídas</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Search and filters */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    type="text"
                    placeholder="Buscar por título, protocolo ou email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select 
                      value={statusFilter} 
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os status</SelectItem>
                        {Object.keys(REQUEST_STATUS).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select 
                      value={departmentFilter} 
                      onValueChange={setDepartmentFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os departamentos</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(statusFilter || departmentFilter || searchTerm) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setStatusFilter("");
                        setDepartmentFilter("");
                        setSearchTerm("");
                      }}
                      className="sm:self-end"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpar filtros
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Requests table */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Protocolo</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow 
                          key={request.id}
                          className={selectedRequest?.id === request.id ? "bg-blue-50" : undefined}
                        >
                          <TableCell className="font-medium">{request.protocol}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{request.title}</TableCell>
                          <TableCell>{request.department}</TableCell>
                          <TableCell>
                            <Badge variant={getBadgeVariant(request.status)}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(request.created_at), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              Visualizar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 px-4">
                  <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Não foram encontradas solicitações com os filtros aplicados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Request details and response section */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Solicitação</CardTitle>
              <CardDescription>
                {selectedRequest 
                  ? `Visualizando protocolo ${selectedRequest.protocol}`
                  : "Selecione uma solicitação para ver os detalhes"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {selectedRequest ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2 justify-between">
                    <Badge variant={getBadgeVariant(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      {format(new Date(selectedRequest.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">{selectedRequest.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Departamento: {selectedRequest.department}
                    </p>
                    <p className="text-sm text-gray-500">
                      Solicitante: {selectedRequest.user_email}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-medium mb-1">Descrição:</h4>
                    <p className="text-sm whitespace-pre-line">
                      {selectedRequest.description}
                    </p>
                  </div>
                  
                  {selectedRequest.attachment_url && (
                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-medium mb-1">Anexo:</h4>
                      <a 
                        href={selectedRequest.attachment_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-600 hover:underline flex items-center"
                      >
                        <FileUp className="h-4 w-4 mr-1" />
                        Visualizar anexo
                      </a>
                    </div>
                  )}
                  
                  {selectedRequest.response && (
                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-medium mb-1">Resposta:</h4>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm whitespace-pre-line">
                          {selectedRequest.response}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Status update buttons */}
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Atualizar Status:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedRequest.status === "Aberto") && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateRequestStatus(selectedRequest.id, "Em Análise")}
                          disabled={updatingStatus}
                        >
                          Em Análise
                        </Button>
                      )}
                      
                      {(selectedRequest.status === "Aberto" || selectedRequest.status === "Em Análise") && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateRequestStatus(selectedRequest.id, "Em Andamento")}
                          disabled={updatingStatus}
                        >
                          Em Andamento
                        </Button>
                      )}
                      
                      {(selectedRequest.status !== "Concluído" && selectedRequest.status !== "Cancelado") && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => updateRequestStatus(selectedRequest.id, "Concluído")}
                          disabled={updatingStatus}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                      
                      {(selectedRequest.status !== "Cancelado" && selectedRequest.status !== "Concluído") && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => updateRequestStatus(selectedRequest.id, "Cancelado")}
                          disabled={updatingStatus}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Response form */}
                  {selectedRequest.status !== "Cancelado" && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Adicionar Resposta:</h4>
                      <Textarea 
                        placeholder="Digite sua resposta para o usuário..."
                        className="min-h-[120px]"
                        value={response}
                        onChange={e => setResponse(e.target.value)}
                      />
                      <Button 
                        className="mt-3 w-full"
                        onClick={handleResponseSubmit}
                        disabled={!response.trim() || updatingStatus}
                      >
                        {updatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Resposta
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500">
                    Selecione uma solicitação na lista para visualizar seus detalhes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
