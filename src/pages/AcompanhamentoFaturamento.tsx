import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useApprovedOrders } from "@/hooks/useApprovedOrders";
import { ApprovedOrdersCockpit } from "@/components/jab-orders/ApprovedOrdersCockpit";
import { FaturamentoHeader } from "@/components/jab-orders/faturamento/FaturamentoHeader";
import { ApprovedOrdersList } from "@/components/jab-orders/faturamento/ApprovedOrdersList";
import { exportOrderToCSV } from "@/utils/csvExport";

const AcompanhamentoFaturamento = () => {
  const { 
    approvedOrders, 
    isLoading, 
    calculateTotals, 
    handleMonthSelect,
    selectedYear,
    selectedMonth
  } = useApprovedOrders();
  
  const { toast } = useToast();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [totals, setTotals] = useState({
    valorTotal: 0,
    quantidadeItens: 0,
    quantidadePedidos: 0,
    valorFaltaFaturar: 0,
    valorFaturado: 0
  });

  useEffect(() => {
    const updateTotals = async () => {
      const calculatedTotals = calculateTotals();
      setTotals(calculatedTotals);
    };
    
    if (!isLoading) {
      updateTotals();
    }
  }, [isLoading, approvedOrders, calculateTotals]);
  
  const handleExpandToggle = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleExportCard = (order: any) => {
    exportOrderToCSV(order, toast);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <FaturamentoHeader 
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
        
        <ApprovedOrdersList 
          approvedOrders={approvedOrders}
          expandedCard={expandedCard}
          onExpandToggle={handleExpandToggle}
          onExportCard={handleExportCard}
        />
      </div>
      <Toaster />
    </main>
  );
};

export default AcompanhamentoFaturamento;
