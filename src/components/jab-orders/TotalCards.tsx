
import { StatCard } from "./cockpit/StatCard";
import { formatCurrency } from "@/utils/formatters";

interface TotalCardsProps {
  valorTotalSaldo: number;
  valorFaturarComEstoque: number;
  valorTotalSaldoPeriodo: number;
  valorFaturarComEstoquePeriodo: number;
  valoresLiberadosParaFaturamento: number;
}

export const TotalCards = ({ 
  valorTotalSaldo, 
  valorFaturarComEstoque, 
  valorTotalSaldoPeriodo,
  valorFaturarComEstoquePeriodo,
  valoresLiberadosParaFaturamento
}: TotalCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard 
        title="Valor Total Saldo" 
        value={formatCurrency(valorTotalSaldo)} 
        color="blue" 
      />
      
      <StatCard 
        title="Faturar com Estoque" 
        value={formatCurrency(valorFaturarComEstoque)} 
        color="green" 
      />
      
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
