
import React from "react";
import { format } from "date-fns";
import { FileUp, CheckCircle, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Request, RequestStatus, REQUEST_STATUS } from "./types";

interface RequestDetailsProps {
  selectedRequest: Request | null;
  response: string;
  setResponse: (value: string) => void;
  updatingStatus: boolean;
  handleResponseSubmit: () => Promise<void>;
  updateRequestStatus: (requestId: string, newStatus: RequestStatus) => Promise<void>;
}

export default function RequestDetails({
  selectedRequest,
  response,
  setResponse,
  updatingStatus,
  handleResponseSubmit,
  updateRequestStatus
}: RequestDetailsProps) {
  const getBadgeVariant = (status: RequestStatus) => {
    return REQUEST_STATUS[status] as "default" | "secondary" | "destructive" | "outline";
  };

  if (!selectedRequest) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">
          Selecione uma solicitação na lista para visualizar seus detalhes.
        </p>
      </div>
    );
  }

  return (
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
  );
}
