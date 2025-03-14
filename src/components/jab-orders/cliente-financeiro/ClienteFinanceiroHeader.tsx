
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, User, Building, AlertCircle } from "lucide-react";
import { VolumeSaudavelDialog } from "@/components/jab-orders/VolumeSaudavelDialog";

interface ClienteFinanceiroHeaderProps {
  clienteNome: string;
  representanteNome: string;
  clienteCodigo: number;
  volumeSaudavel: number | null;
  hasVencidos: boolean;
  isExpanded: boolean;
  toggleExpand: () => void;
  onUpdateVolumeSaudavel: (clienteCodigo: number, valor: number) => Promise<{ success: boolean; error?: any }>;
}

export const ClienteFinanceiroHeader = ({
  clienteNome,
  representanteNome,
  clienteCodigo,
  volumeSaudavel,
  hasVencidos,
  isExpanded,
  toggleExpand,
  onUpdateVolumeSaudavel
}: ClienteFinanceiroHeaderProps) => {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CardTitle>{clienteNome}</CardTitle>
            {hasVencidos && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Valores vencidos
              </span>
            )}
          </div>
          <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>Representante: {representanteNome}</span>
            </span>
            <span className="flex items-center gap-1">
              <Building className="h-3.5 w-3.5" />
              <span>Código: {clienteCodigo}</span>
            </span>
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          <VolumeSaudavelDialog
            clienteNome={clienteNome}
            clienteCodigo={clienteCodigo}
            valorAtual={volumeSaudavel}
            onUpdate={onUpdateVolumeSaudavel}
          />
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={toggleExpand}
            className="rounded-full h-8 w-8 p-0"
            aria-label={isExpanded ? "Recolher" : "Expandir"}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
