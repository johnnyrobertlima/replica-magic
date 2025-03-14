
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import { SeparacaoCard } from "@/components/jab-orders/SeparacaoCard";
import { ClienteFinanceiroInfo } from "@/components/jab-orders/ClienteFinanceiroInfo";
import { VolumeSaudavelDialog } from "@/components/jab-orders/VolumeSaudavelDialog";
import { useToast } from "@/hooks/use-toast";
import { ClienteFinanceiro } from "@/types/financialClient";

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

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isExpanded ? "md:col-span-2" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{clienteNome}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <User className="h-3.5 w-3.5" />
              <span>Representante: {representanteNome}</span>
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
          <h3 className="font-semibold text-lg mb-2">Pedidos Pendentes</h3>
          <div className="space-y-4">
            {cliente.separacoes.map(separacao => {
              const isSeparacaoExpanded = expandedSeparacoes.includes(separacao.id);
              
              return (
                <div key={separacao.id} className="relative border rounded-lg">
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
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
