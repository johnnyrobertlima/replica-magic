
import { useEffect } from "react";
import { useRequestsFetching } from "./hooks/useRequestsFetching";
import { useRequestsFiltering } from "./hooks/useRequestsFiltering";
import { useRequestOperations } from "./hooks/useRequestOperations";

export function useRequestsAdmin() {
  const { 
    requests, 
    setRequests, 
    isLoading, 
    fetchRequests 
  } = useRequestsFetching();
  
  const {
    filteredRequests,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    departmentFilter,
    setDepartmentFilter,
    activeTab,
    setActiveTab,
    departments,
    clearFilters
  } = useRequestsFiltering(requests);
  
  const {
    selectedRequest,
    setSelectedRequest,
    response,
    setResponse,
    updatingStatus,
    handleResponseSubmit,
    updateRequestStatus
  } = useRequestOperations(requests, setRequests);

  // Fetch all requests on initial load
  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    // Data fetching
    requests,
    isLoading,
    fetchRequests,
    
    // Filtering
    filteredRequests,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    departmentFilter,
    setDepartmentFilter,
    activeTab,
    setActiveTab,
    departments,
    clearFilters,
    
    // Request operations
    selectedRequest,
    setSelectedRequest,
    response,
    setResponse,
    updatingStatus,
    handleResponseSubmit,
    updateRequestStatus
  };
}
