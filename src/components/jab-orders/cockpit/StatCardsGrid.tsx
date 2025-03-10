
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "./StatCard";

interface StatCardsGridProps {
  valorTotal: number;
  valorFaturado: number;
  valorFaltaFaturar: number;
  quantidadePedidos: number;
  quantidadeItens: number;
}

export const StatCardsGrid = ({
  valorTotal,
  valorFaturado,
  valorFaltaFaturar,
  quantidadePedidos,
  quantidadeItens
}: StatCardsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard 
        title="Valor Total Aprovado" 
        value={formatCurrency(valorTotal)} 
        color="green" 
      />
      
      <StatCard 
        title="Valor Faturado" 
        value={formatCurrency(valorFaturado)} 
        color="blue" 
      />
      
      <StatCard 
        title="Falta Faturar" 
        value={formatCurrency(valorFaltaFaturar)} 
        color="amber" 
      />
      
      <StatCard 
        title="Pedidos Aprovados" 
        value={quantidadePedidos} 
        color="purple" 
      />
      
      <StatCard 
        title="Quantidade de Itens" 
        value={quantidadeItens} 
        color="indigo" 
      />
    </div>
  );
};
