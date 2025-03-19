
import React from "react";
import { format } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Request, RequestStatus, REQUEST_STATUS } from "./types";

interface RequestsTableProps {
  filteredRequests: Request[];
  isLoading: boolean;
  selectedRequest: Request | null;
  setSelectedRequest: (request: Request) => void;
}

export default function RequestsTable({
  filteredRequests,
  isLoading,
  selectedRequest,
  setSelectedRequest
}: RequestsTableProps) {
  const getBadgeVariant = (status: RequestStatus) => {
    return REQUEST_STATUS[status] as "default" | "secondary" | "destructive" | "outline";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">
          Não foram encontradas solicitações com os filtros aplicados.
        </p>
      </div>
    );
  }

  return (
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
  );
}
