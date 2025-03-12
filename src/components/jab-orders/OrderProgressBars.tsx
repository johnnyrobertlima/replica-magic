
import { Progress } from "@/components/ui/progress";

interface OrderProgressBarsProps {
  progressFaturamento: number;
  progressPotencial: number;
}

export const OrderProgressBars = ({ 
  progressFaturamento, 
  progressPotencial 
}: OrderProgressBarsProps) => {
  // Ensure values are within valid range (0-100)
  const safeProgressFaturamento = Math.min(Math.max(0, progressFaturamento), 100);
  const safeProgressPotencial = Math.min(Math.max(0, progressPotencial), 100);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Faturamento</span>
          <span>{Math.round(safeProgressFaturamento)}%</span>
        </div>
        <Progress value={safeProgressFaturamento} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Potencial com Estoque</span>
          <span>{Math.round(safeProgressPotencial)}%</span>
        </div>
        <Progress value={safeProgressPotencial} className="h-2" />
      </div>
    </div>
  );
};
