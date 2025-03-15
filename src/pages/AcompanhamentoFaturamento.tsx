import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useApprovedOrders } from "@/hooks/useApprovedOrders";
import { ApprovedOrdersCockpit } from "@/components/jab-orders/ApprovedOrdersCockpit";
import { AcompanhamentoHeader } from "@/components/jab-orders/acompanhamento/AcompanhamentoHeader";
import { ApprovedOrdersList } from "@/components/jab-orders/acompanhamento/ApprovedOrdersList";

const AcompanhamentoFaturamento = () => {
  const { 
    approvedOrders, 
    isLoading, 
    calculateTotals, 
    handleMonthSelect,
    selectedYear,
    selectedMonth
  } = useApprovedOrders();
  
  const [totals, setTotals] = useState({
    valorTotal: 0,
    quantidadeItens: 0,
    quantidadePedidos: 0,
    valorFaltaFaturar: 0,
    valorFaturado: 0
  });
  
  useEffect(() => {
    const updateTotals = async () => {
      try {
        // calculateTotals now returns a Promise in the updated version
        const calculatedTotals = await calculateTotals();
        console.log("AcompanhamentoFaturamento: Updated totals", calculatedTotals);
        setTotals(calculatedTotals);
      } catch (error) {
        console.error("Error calculating totals:", error);
        // Keep existing totals on error
      }
    };
    
    if (!isLoading) {
      updateTotals();
    }
  }, [isLoading, approvedOrders, calculateTotals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <AcompanhamentoHeader 
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onMonthSelect={handleMonthSelect}
      />

      <div className="space-y-6">
        <ApprovedOrdersCockpit 
          valorTotal={totals.valorTotal}
          quantidadeItens={totals.quantidadeItens}
          quantidadePedidos={totals.quantidadePedidos}
          valorFaltaFaturar={totals.valorFaltaFaturar}
          valorFaturado={totals.valorFaturado}
        />
        
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Pedidos Aprovados</h2>
          <p className="text-sm text-muted-foreground">
            Total de {approvedOrders.length} {approvedOrders.length === 1 ? 'pedido aprovado' : 'pedidos aprovados'}
          </p>
        </div>
        
        <ApprovedOrdersList approvedOrders={approvedOrders} />
      </div>
      <Toaster />
    </main>
  );
};

export default AcompanhamentoFaturamento;
