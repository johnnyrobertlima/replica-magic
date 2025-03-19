
import React from "react";
import { format } from "date-fns";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Request, RequestStatus, REQUEST_STATUS } from "./types";

interface RequestDetailsProps {
  selectedRequest: Request | null;
  response: string;
  setResponse: (value: string) => void;
  updatingStatus: boolean;
  handleResponseSubmit: () => Promise<void>;
  updateRequestStatus: (status: RequestStatus) => Promise<void>;
}

export default function RequestDetails({
  selectedRequest,
  response,
  setResponse,
  updatingStatus,
  handleResponseSubmit,
  updateRequestStatus
}: RequestDetailsProps) {
  if (!selectedRequest) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="font-medium text-gray-900">Nenhuma solicitação selecionada</h3>
        <p className="text-sm text-gray-500 mt-2">
          Selecione uma solicitação na tabela para visualizar os detalhes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Request details */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{selectedRequest.title}</h3>
            <p className="text-sm text-gray-500">Protocolo: {selectedRequest.protocol}</p>
          </div>
          <Badge variant={REQUEST_STATUS[selectedRequest.status] as "default" | "secondary" | "destructive" | "outline"}>
            {selectedRequest.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Departamento</p>
            <p className="font-medium">{selectedRequest.department}</p>
          </div>
          <div>
            <p className="text-gray-500">Data</p>
            <p className="font-medium">{format(new Date(selectedRequest.created_at), 'dd/MM/yyyy HH:mm')}</p>
          </div>
          <div>
            <p className="text-gray-500">Usuário</p>
            <p className="font-medium">{selectedRequest.user_email}</p>
          </div>
          <div>
            <p className="text-gray-500">Atualizado</p>
            <p className="font-medium">{format(new Date(selectedRequest.updated_at || selectedRequest.created_at), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>
        
        <div>
          <p className="text-gray-500 text-sm mb-1">Descrição</p>
          <div className="p-3 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">
            {selectedRequest.description}
          </div>
        </div>
        
        {selectedRequest.attachment_url && (
          <div>
            <p className="text-gray-500 text-sm mb-1">Anexo</p>
            <a 
              href={selectedRequest.attachment_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-600 hover:underline"
            >
              <FileText className="h-4 w-4 mr-1" />
              Ver anexo
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        )}
        
        {selectedRequest.response && (
          <div>
            <p className="text-gray-500 text-sm mb-1">Resposta</p>
            <div className="p-3 bg-blue-50 rounded-md text-sm whitespace-pre-wrap">
              {selectedRequest.response}
            </div>
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Update status */}
      <div>
        <p className="text-gray-500 text-sm mb-2">Atualizar Status</p>
        <div className="flex gap-2">
          <Select
            disabled={updatingStatus}
            value={selectedRequest.status}
            onValueChange={(value) => updateRequestStatus(value as RequestStatus)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(REQUEST_STATUS).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Response form */}
      <div>
        <p className="text-gray-500 text-sm mb-2">Responder Solicitação</p>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Digite sua resposta aqui..."
          className="min-h-[120px]"
          disabled={updatingStatus}
        />
        <Button
          className="w-full mt-2"
          onClick={handleResponseSubmit}
          disabled={updatingStatus || !response.trim()}
        >
          {updatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar Resposta
        </Button>
      </div>
    </div>
  );
}
