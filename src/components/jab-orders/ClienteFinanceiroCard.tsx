
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, User, Building, Phone, AlertCircle } from "lucide-react";
import { SeparacaoCard } from "@/components/jab-orders/SeparacaoCard";
import { ClienteFinanceiroInfo } from "@/components/jab-orders/ClienteFinanceiroInfo";
import { VolumeSaudavelDialog } from "@/components/jab-orders/VolumeSaudavelDialog";
import { useToast } from "@/hooks/use-toast";
import { ClienteFinanceiro } from "@/types/financialClient";
import { getCardBorderClass } from "@/utils/formatters";

interface ClienteFinanceiroCardProps {
  cliente: ClienteFinanceiro;
  onUpdateVolumeSaudavel: (clienteCodigo: number, valor: number) => Promise<{ success: boolean; error?: any }>;
  onHideCard: (id: string) => void;
  onApprove: (separacaoId: string) => void;
  onReject: (separacaoId: string) => void;
  expandedView?: boolean;
  showApprovalButtons?: boolean;
}

export const ClienteFinanceiroCard = ({ 
  cliente, 
  onUpdateVolumeSaudavel,
  onHideCard,
  onApprove,
  onReject,
  expandedView = false,
  showApprovalButtons = true
}: ClienteFinanceiroCardProps) => {
  const [isExpanded, setIsExpanded] = useState(expandedView);
  const [expandedSeparacoes, setExpandedSeparacoes] = useState<string[]>([]);
  const { toast } = useToast();

  const borderClass = getCardBorderClass(cliente.valoresVencidos, cliente.valoresEmAberto);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleExpandToggle = (id: string, expanded: boolean) => {
    setExpandedSeparacoes(current => {
      if (expanded && !current.includes(id)) {
        return [...current, id];
      } else if (!expanded && current.includes(id)) {
        return current.filter(cardId => cardId !== id);
      }
      return current;
    });
  };

  const handleAprovar = (id: string) => {
    onApprove(id);
    
    toast({
      title: "Sucesso",
      description: "Pedido aprovado com sucesso!",
      variant: "default",
    });
    
    onHideCard(id);
  };

  const handleReprovar = (id: string) => {
    onReject(id);
    
    toast({
      title: "Aviso",
      description: "Pedido reprovado!",
      variant: "destructive",
    });
    
    onHideCard(id);
  };

  const clienteNome = cliente.APELIDO || `Cliente ${cliente.PES_CODIGO}`;
  const representanteNome = cliente.representanteNome || "Não informado";
  
  // Determine alert status for card
  const hasVencidos = cliente.valoresVencidos > 0;

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${isExpanded ? "md:col-span-2" : ""} ${borderClass}`}>
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
                <span>Código: {cliente.PES_CODIGO}</span>
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <VolumeSaudavelDialog
              clienteNome={clienteNome}
              clienteCodigo={cliente.PES_CODIGO}
              valorAtual={cliente.volume_saudavel_faturamento}
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
      
      <CardContent className="space-y-6">
        <ClienteFinanceiroInfo
          valoresTotais={cliente.valoresTotais}
          valoresEmAberto={cliente.valoresEmAberto}
          valoresVencidos={cliente.valoresVencidos}
          volumeSaudavel={cliente.volume_saudavel_faturamento}
        />

        <div>
          <h3 className="font-semibold text-lg mb-3">Pedidos Pendentes</h3>
          <div className="space-y-4">
            {cliente.separacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhum pedido pendente encontrado.</p>
            ) : (
              cliente.separacoes.map(separacao => {
                const isSeparacaoExpanded = expandedSeparacoes.includes(separacao.id);
                
                return (
                  <div key={separacao.id} className="relative border rounded-lg bg-white shadow-sm transition-all hover:shadow">
                    <SeparacaoCard 
                      separacao={separacao} 
                      expandedView={isSeparacaoExpanded}
                      onExpandToggle={handleExpandToggle}
                    />
                    
                    {showApprovalButtons && (
                      <div className="flex justify-end gap-2 p-4 border-t">
                        <Button
                          variant="destructive"
                          size="sm"
                          type="button"
                          onClick={() => handleReprovar(separacao.id)}
                        >
                          Reprovar
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          type="button"
                          onClick={() => handleAprovar(separacao.id)}
                        >
                          Aprovar
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
