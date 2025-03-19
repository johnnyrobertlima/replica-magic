
import { useState, useEffect } from "react";
import { Request } from "../types";

export function useRequestsFiltering(requests: Request[]) {
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Extract unique departments from requests for filter
  const departments = Array.from(new Set(requests.map(req => req.department))).sort();

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [requests, searchTerm, statusFilter, departmentFilter, activeTab]);
  
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
  
  const clearFilters = () => {
    setStatusFilter("");
    setDepartmentFilter("");
    setSearchTerm("");
  };

  return {
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
  };
}
