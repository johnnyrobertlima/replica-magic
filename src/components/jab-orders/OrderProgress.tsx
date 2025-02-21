
import { Progress } from "@/components/ui/progress";
import type { OrderProgressProps } from "./types";

export const OrderProgress = ({ valorTotalPedido, valorFaturado, valorFaturarComEstoque, valor_total }: OrderProgressProps) => {
  const progressFaturamento = valorTotalPedido > 0 
    ? (valorFaturado / valorTotalPedido) * 100 
    : 0;
    
  const progressPotencial = valor_total > 0 
    ? (valorFaturarComEstoque / valor_total) * 100 
    : 0;

  return (
    <div className="space-y-4 mt-2">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Faturamento</span>
          <span>{Math.round(progressFaturamento)}%</span>
        </div>
        <Progress value={progressFaturamento} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Potencial com Estoque</span>
          <span>{Math.round(progressPotencial)}%</span>
        </div>
        <Progress value={progressPotencial} className="h-2" />
      </div>
    </div>
  );
};
