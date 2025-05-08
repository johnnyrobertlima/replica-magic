
import { useState, useEffect } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePautaStatus } from "./hooks/usePautaStatus";
import { useToast } from "@/hooks/use-toast";

interface PautaStatusIndicatorProps {
  events: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
}

export function PautaStatusIndicator({ 
  events, 
  clientId,
  month,
  year
}: PautaStatusIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { clientScopes, error } = usePautaStatus(clientId, month, year, events);
  
  console.log(`PautaStatusIndicator - clientId: ${clientId}, month: ${month}, year: ${year}, scopes: ${clientScopes?.length || 0}, events: ${events?.length || 0}`);

  // Show error toast if there was a problem fetching scopes
  useEffect(() => {
    if (error) {
      console.error("Error fetching client scopes:", error);
      toast({
        title: "Erro ao carregar escopo do cliente",
        description: "Não foi possível obter informações sobre o escopo do cliente.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Get the service counts from the events for the current month/year
  const serviceCounts: Record<string, number> = {};
  if (events && events.length > 0) {
    events.forEach(event => {
      if (event.service_id) {
        if (serviceCounts[event.service_id]) {
          serviceCounts[event.service_id]++;
        } else {
          serviceCounts[event.service_id] = 1;
        }
      }
    });
  }

  // Calculate if all services are complete according to the scope
  const incompleteScopes = clientScopes.filter(scope => {
    const completed = serviceCounts[scope.service_id] || 0;
    return completed < scope.quantity;
  });

  const isPautaComplete = incompleteScopes.length === 0 && clientScopes.length > 0;

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // If there are no client scopes, don't render anything
  if (!clientScopes || clientScopes.length === 0) {
    console.log("No client scopes found, not rendering PautaStatusIndicator for client:", clientId);
    return null;
  }

  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        className={cn(
          "flex items-center gap-2 w-full justify-start text-left mb-2",
          isPautaComplete 
            ? "text-green-700 hover:text-green-800 hover:bg-green-50" 
            : "text-red-600 hover:text-red-700 hover:bg-red-50"
        )}
        onClick={toggleExpanded}
      >
        {isPautaComplete ? (
          <>
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">✅ Pauta Completa – Parabéns!</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">⚠️ Existem pendências no escopo do mês</span>
          </>
        )}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 ml-auto" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-auto" />
        )}
      </Button>

      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 animate-fade-in p-2 bg-gray-50 rounded-md">
          {clientScopes.map((scope) => {
            const completed = serviceCounts[scope.service_id] || 0;
            const isComplete = completed >= scope.quantity;
            
            return (
              <div 
                key={scope.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md",
                  isComplete 
                    ? "bg-green-50 border border-green-100" 
                    : "bg-red-50 border border-red-100"
                )}
              >
                <span className="text-sm font-medium truncate mr-2">
                  {scope.service_name}
                </span>
                <span 
                  className={cn(
                    "text-sm font-medium",
                    isComplete ? "text-green-700" : "text-red-600"
                  )}
                >
                  {completed}/{scope.quantity}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
