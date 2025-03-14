
import { SeparacaoCard } from "@/components/jab-orders/SeparacaoCard";
import { ApprovalButtons } from "@/components/jab-orders/cliente-financeiro/ApprovalButtons";

interface SeparacoesListProps {
  separacoes: any[];
  expandedSeparacoes: string[];
  onExpandToggle: (id: string, expanded: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  showApprovalButtons: boolean;
}

export const SeparacoesList = ({
  separacoes,
  expandedSeparacoes,
  onExpandToggle,
  onApprove,
  onReject,
  showApprovalButtons
}: SeparacoesListProps) => {
  if (separacoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">Nenhum pedido pendente encontrado.</p>
    );
  }

  return (
    <>
      {separacoes.map(separacao => {
        console.log("Rendering separacao:", separacao.id, "expanded:", expandedSeparacoes.includes(separacao.id));
        const isSeparacaoExpanded = expandedSeparacoes.includes(separacao.id);
        
        return (
          <div key={separacao.id} className="relative border rounded-lg bg-white shadow-sm transition-all hover:shadow">
            <SeparacaoCard 
              separacao={separacao} 
              expandedView={isSeparacaoExpanded}
              onExpandToggle={onExpandToggle}
            />
            
            <ApprovalButtons
              separacaoId={separacao.id}
              onApprove={onApprove}
              onReject={onReject}
              showButtons={showApprovalButtons}
            />
          </div>
        );
      })}
    </>
  );
};
