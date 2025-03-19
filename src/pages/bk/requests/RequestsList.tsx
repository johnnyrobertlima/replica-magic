
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Request } from "./types";
import { RequestItem } from "./components/RequestItem";
import { EmptyRequests } from "./components/EmptyRequests";
import { RequestsLoading } from "./components/RequestsLoading";

interface RequestsListProps {
  requests: Request[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function RequestsList({ requests, isLoading, onRefresh }: RequestsListProps) {
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
          <RequestsLoading />
        ) : requests.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {requests.map((request) => (
              <RequestItem key={request.id} request={request} />
            ))}
          </Accordion>
        ) : (
          <EmptyRequests />
        )}
      </CardContent>
    </Card>
  );
}
