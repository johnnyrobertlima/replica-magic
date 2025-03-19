
import { format } from "date-fns";
import { FileUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { REQUEST_STATUS, Request, RequestStatus } from "../types";

interface RequestItemProps {
  request: Request;
}

export function RequestItem({ request }: RequestItemProps) {
  const getBadgeVariant = (status: RequestStatus) => {
    return REQUEST_STATUS[status] as "default" | "secondary" | "destructive" | "outline";
  };

  return (
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
  );
}
