
import React from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRequestsAdmin } from "./useRequestsAdmin";
import RequestFilters from "./RequestFilters";
import RequestsTable from "./RequestsTable";
import RequestDetails from "./RequestDetails";

const AdminRequests = () => {
  const {
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
    clearFilters,
    currentPage,
    totalPages,
    handlePageChange
  } = useRequestsAdmin();

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
                  onClick={() => fetchRequests(1)}
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
              <RequestFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                departmentFilter={departmentFilter}
                setDepartmentFilter={setDepartmentFilter}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                departments={departments}
                clearFilters={clearFilters}
              />
              
              <RequestsTable 
                filteredRequests={filteredRequests}
                isLoading={isLoading}
                selectedRequest={selectedRequest}
                setSelectedRequest={setSelectedRequest}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
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
              <RequestDetails 
                selectedRequest={selectedRequest}
                response={response}
                setResponse={setResponse}
                updatingStatus={updatingStatus}
                handleResponseSubmit={handleResponseSubmit}
                updateRequestStatus={updateRequestStatus}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
