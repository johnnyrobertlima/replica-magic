
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";
import { MonthFilterSelect } from "@/components/jab-orders/MonthFilterSelect";

interface AcompanhamentoHeaderProps {
  selectedYear: number;
  selectedMonth: number;
  onMonthSelect: (year: number, month: number) => void;
}

export const AcompanhamentoHeader = ({ 
  selectedYear, 
  selectedMonth,
  onMonthSelect
}: AcompanhamentoHeaderProps) => {
  const formattedMonth = format(
    new Date(selectedYear, selectedMonth - 1, 1),
    "MMMM 'de' yyyy",
    { locale: ptBR }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Acompanhamento de Faturamento</h1>
          <p className="text-muted-foreground mt-1">
            Pedidos aprovados em <span className="font-medium">{formattedMonth}</span>
          </p>
        </div>
        
        <MonthFilterSelect onMonthSelect={onMonthSelect} />
      </div>
    </div>
  );
};
