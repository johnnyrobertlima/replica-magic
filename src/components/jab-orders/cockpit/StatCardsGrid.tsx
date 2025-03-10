
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "./StatCard";

interface StatCardsGridProps {
  valorTotal: number;
  valorFaturado: number;
  valorFaltaFaturar: number;
  quantidadePedidos: number;
  quantidadeItens: number;
  className?: string;
  isLoading?: boolean;
}

export const StatCardsGrid = ({
  valorTotal = 0,
  valorFaturado = 0,
  valorFaltaFaturar = 0,
  quantidadePedidos = 0,
  quantidadeItens = 0,
  className,
  isLoading = false
}: StatCardsGridProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 ${className || ''}`}>
      <StatCard 
        title="Valor Total Aprovado" 
        value={isLoading ? "..." : formatCurrency(valorTotal)} 
        color="green" 
      />
      
      <StatCard 
        title="Valor Faturado" 
        value={isLoading ? "..." : formatCurrency(valorFaturado)} 
        color="blue" 
      />
      
      <StatCard 
        title="Falta Faturar" 
        value={isLoading ? "..." : formatCurrency(valorFaltaFaturar)} 
        color="amber" 
      />
      
      <StatCard 
        title="Pedidos Aprovados" 
        value={isLoading ? "..." : quantidadePedidos} 
        color="purple" 
      />
      
      <StatCard 
        title="Quantidade de Itens" 
        value={isLoading ? "..." : quantidadeItens} 
        color="indigo" 
      />
    </div>
  );
};
