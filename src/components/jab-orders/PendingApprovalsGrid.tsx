
import { ClienteFinanceiroCard } from "@/components/jab-orders/ClienteFinanceiroCard";
import { EmptyPendingApprovals } from "@/components/jab-orders/EmptyPendingApprovals";
import { ClienteFinanceiro } from "@/types/financialClient";

interface PendingApprovalsGridProps {
  clientes: ClienteFinanceiro[];
  onUpdateVolumeSaudavel: (clienteCodigo: number, valor: number) => Promise<{ success: boolean; error?: any }>;
  onHideCard: (id: string) => void;
  onApprove: (separacaoId: string, cliente: any) => void;
  onReject: (separacaoId: string, cliente: any) => void;
}

export const PendingApprovalsGrid = ({
  clientes,
  onUpdateVolumeSaudavel,
  onHideCard,
  onApprove,
  onReject
}: PendingApprovalsGridProps) => {
  if (!clientes.length) {
    return <EmptyPendingApprovals />;
  }

  return (
    <>
      {clientes.map((cliente) => (
        <ClienteFinanceiroCard
          key={cliente.PES_CODIGO}
          cliente={cliente}
          onUpdateVolumeSaudavel={onUpdateVolumeSaudavel}
          onHideCard={onHideCard}
          onApprove={(separacaoId) => onApprove(separacaoId, cliente)}
          onReject={(separacaoId) => onReject(separacaoId, cliente)}
        />
      ))}
    </>
  );
};
