
import { StatCard } from "@/components/jab-orders/cockpit/StatCard";
import { formatCurrency, formatNumber } from "@/utils/formatters";

interface FilteredTotalCardsProps {
  valorTotalPedido: number;
  clientesCount: number;
  faltaFaturar: number;
}

export const FilteredTotalCards = ({ 
  valorTotalPedido,
  clientesCount,
  faltaFaturar
}: FilteredTotalCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard 
        title="Valor Total do Pedido" 
        value={formatCurrency(valorTotalPedido)} 
        color="green" 
      />
      
      <StatCard 
        title="Clientes" 
        value={formatNumber(clientesCount)} 
        color="blue" 
      />
      
      <StatCard 
        title="Falta Faturar" 
        value={formatCurrency(faltaFaturar)} 
        color="amber" 
      />
    </div>
  );
};
