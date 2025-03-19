
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequestStatus, REQUEST_STATUS } from "./types";

interface RequestFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: RequestStatus | "all";
  setStatusFilter: (value: RequestStatus | "all") => void;
  departmentFilter: string | "all";
  setDepartmentFilter: (value: string | "all") => void;
  activeTab: "all" | "pending" | "completed";
  setActiveTab: (value: "all" | "pending" | "completed") => void;
  departments: string[];
  clearFilters: () => void;
}

export default function RequestFilters({
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
}: RequestFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "pending" | "completed")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar por protocolo, título ou email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Department filter */}
        <Select
          value={departmentFilter}
          onValueChange={(value) => setDepartmentFilter(value)}
        >
          <SelectTrigger className="w-full md:w-[180px] flex-shrink-0">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Status filter */}
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as RequestStatus | "all")}
        >
          <SelectTrigger className="w-full md:w-[180px] flex-shrink-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            {Object.keys(REQUEST_STATUS).map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Clear filters */}
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="flex-shrink-0"
        >
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
