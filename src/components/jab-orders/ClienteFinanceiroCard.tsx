
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClienteFinanceiroInfo } from "@/components/jab-orders/ClienteFinanceiroInfo";
import { useToast } from "@/hooks/use-toast";
import { ClienteFinanceiro } from "@/types/financialClient";
import { getCardBorderClass } from "@/utils/formatters";
import { ClienteFinanceiroHeader } from "@/components/jab-orders/cliente-financeiro/ClienteFinanceiroHeader";
import { SeparacoesList } from "@/components/jab-orders/cliente-financeiro/SeparacoesList";

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
  const [expandedSeparacoes, setExpandedSeparacoes] = useState<string[]>(
    expandedView && cliente.separacoes && cliente.separacoes.length > 0 
      ? [cliente.separacoes[0].id] 
      : []
  );
  const { toast } = useToast();

  const borderClass = getCardBorderClass(cliente.valoresVencidos, cliente.valoresEmAberto);

  // Update expandedSeparacoes when expandedView changes from parent
  useEffect(() => {
    if (expandedView && cliente.separacoes && cliente.separacoes.length > 0) {
      // Automatically expand the first separação when card is expanded
      setExpandedSeparacoes([cliente.separacoes[0].id]);
    } else if (!expandedView) {
      setExpandedSeparacoes([]);
    }
    
    setIsExpanded(expandedView);
  }, [expandedView, cliente.separacoes]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleExpandToggle = (id: string, expanded: boolean) => {
    console.log("Handling expand toggle for separacao:", id, "to state:", expanded);
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
      <ClienteFinanceiroHeader
        clienteNome={clienteNome}
        representanteNome={representanteNome}
        clienteCodigo={cliente.PES_CODIGO}
        volumeSaudavel={cliente.volume_saudavel_faturamento}
        hasVencidos={hasVencidos}
        isExpanded={isExpanded}
        toggleExpand={toggleExpand}
        onUpdateVolumeSaudavel={onUpdateVolumeSaudavel}
      />
      
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
            <SeparacoesList
              separacoes={cliente.separacoes}
              expandedSeparacoes={expandedSeparacoes}
              onExpandToggle={handleExpandToggle}
              onApprove={handleAprovar}
              onReject={handleReprovar}
              showApprovalButtons={showApprovalButtons}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
