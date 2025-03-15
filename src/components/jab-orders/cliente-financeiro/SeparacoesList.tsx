
import { useState } from "react";
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
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  
  if (separacoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">Nenhum pedido pendente encontrado.</p>
    );
  }
  
  const handleApprove = (id: string) => {
    setApprovedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    onApprove(id);
  };
  
  const handleReject = (id: string) => {
    setRejectedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    onReject(id);
  };

  return (
    <>
      {separacoes.map(separacao => {
        const isSeparacaoExpanded = expandedSeparacoes.includes(separacao.id);
        const isApproved = approvedIds.has(separacao.id);
        const isRejected = rejectedIds.has(separacao.id);
        
        // Skip rendering if approved or rejected
        if (isApproved || isRejected) {
          const status = isApproved ? "aprovado" : "reprovado";
          return (
            <div key={separacao.id} className="relative border rounded-lg bg-white shadow-sm transition-all hover:shadow">
              <div className="p-4 flex justify-between items-center">
                <span className="font-medium">Pedido: {separacao.id}</span>
                <span className={`px-2 py-1 text-sm font-medium rounded-md ${
                  status === "aprovado" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {status === "aprovado" ? "Aprovado" : "Reprovado"}
                </span>
              </div>
            </div>
          );
        }
        
        return (
          <div key={separacao.id} className="relative border rounded-lg bg-white shadow-sm transition-all hover:shadow">
            <SeparacaoCard 
              separacao={separacao} 
              expandedView={isSeparacaoExpanded}
              onExpandToggle={onExpandToggle}
            />
            
            <ApprovalButtons
              separacaoId={separacao.id}
              onApprove={handleApprove}
              onReject={handleReject}
              showButtons={showApprovalButtons}
            />
          </div>
        );
      })}
    </>
  );
};
