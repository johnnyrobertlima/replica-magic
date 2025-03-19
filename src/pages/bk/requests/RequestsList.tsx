
import { format } from "date-fns";
import { AlertCircle, FileUp, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { REQUEST_STATUS, Request, RequestStatus } from "./types";

interface RequestsListProps {
  requests: Request[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function RequestsList({ requests, isLoading, onRefresh }: RequestsListProps) {
  const getBadgeVariant = (status: RequestStatus) => {
    return REQUEST_STATUS[status] as "default" | "secondary" | "destructive" | "outline";
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Minhas Solicitações</CardTitle>
          <CardDescription>
            Acompanhe o status das suas solicitações
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : requests.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {requests.map((request) => (
              <AccordionItem key={request.id} value={request.id} className="border-b">
                <AccordionTrigger className="py-4 hover:no-underline hover:bg-gray-50 px-4 -mx-4 rounded-md">
                  <div className="flex items-center justify-between w-full text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant={getBadgeVariant(request.status)}>
                        {request.status}
                      </Badge>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.protocol} • {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground hidden md:block">
                      {request.department}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 px-4 pt-2">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium">Descrição:</h4>
                      <p className="mt-1 text-sm whitespace-pre-line">
                        {request.description}
                      </p>
                    </div>
                    
                    {request.attachment_url && (
                      <div>
                        <h4 className="text-sm font-medium">Anexo:</h4>
                        <a 
                          href={request.attachment_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-blue-600 hover:underline flex items-center mt-1"
                        >
                          <FileUp className="h-4 w-4 mr-1" />
                          Visualizar anexo
                        </a>
                      </div>
                    )}
                    
                    {request.response && (
                      <div className="mt-4 bg-blue-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium">Resposta:</h4>
                        <p className="mt-1 text-sm whitespace-pre-line">
                          {request.response}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                      <p>Criado em: {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}</p>
                      {request.updated_at !== request.created_at && (
                        <p>Atualizado em: {format(new Date(request.updated_at), 'dd/MM/yyyy HH:mm')}</p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-10 px-4">
            <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Você ainda não possui solicitações. Use o formulário ao lado para criar uma nova solicitação.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
