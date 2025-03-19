
import { useState, useMemo, useEffect } from "react";
import { Request, RequestStatus } from "../types";

export function useRequestsFiltering(requests: Request[]) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string | "all">("all");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");

  // Extract unique departments from requests
  const departments = useMemo(() => {
    const uniqueDepartments = Array.from(new Set(requests.map(req => req.department)));
    return uniqueDepartments.sort();
  }, [requests]);

  // Filter requests based on search term, status, and department
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        req =>
          req.protocol.toLowerCase().includes(searchLower) ||
          req.title.toLowerCase().includes(searchLower) ||
          req.description.toLowerCase().includes(searchLower) ||
          req.user_email.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(req => req.department === departmentFilter);
    }

    // Apply tab filter
    if (activeTab === "pending") {
      filtered = filtered.filter(req => 
        ["Aberto", "Em Análise", "Em Andamento"].includes(req.status)
      );
    } else if (activeTab === "completed") {
      filtered = filtered.filter(req => 
        ["Respondido", "Concluído", "Cancelado"].includes(req.status)
      );
    }

    return filtered;
  }, [requests, searchTerm, statusFilter, departmentFilter, activeTab]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setActiveTab("all");
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
