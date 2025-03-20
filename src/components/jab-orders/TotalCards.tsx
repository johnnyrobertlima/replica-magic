
import { StatCard } from "./cockpit/StatCard";
import { formatCurrency } from "@/utils/formatters";

interface TotalCardsProps {
  valorTotalSaldoPeriodo: number;
  valorFaturarComEstoquePeriodo: number;
  valoresLiberadosParaFaturamento: number;
}

export const TotalCards = ({ 
  valorTotalSaldoPeriodo,
  valorFaturarComEstoquePeriodo,
  valoresLiberadosParaFaturamento
}: TotalCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard 
        title="Valor Total Saldo Período" 
        value={formatCurrency(valorTotalSaldoPeriodo)} 
        color="indigo" 
      />
      
      <StatCard 
        title="Faturar com Estoque Período" 
        value={formatCurrency(valorFaturarComEstoquePeriodo)} 
        color="purple" 
      />
      
      <StatCard 
        title="Valores Liberados p/ Faturamento" 
        value={formatCurrency(valoresLiberadosParaFaturamento)} 
        color="amber" 
      />
    </div>
  );
};
