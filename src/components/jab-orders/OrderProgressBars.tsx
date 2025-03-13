
import { Progress } from "@/components/ui/progress";

interface OrderProgressBarsProps {
  progressFaturamento: number;
  progressPotencial: number;
}

export const OrderProgressBars = ({ progressFaturamento, progressPotencial }: OrderProgressBarsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Faturamento</span>
          <span>{Math.round(progressFaturamento)}%</span>
        </div>
        <Progress value={progressFaturamento} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Potencial com Estoque</span>
          <span>{Math.round(progressPotencial)}%</span>
        </div>
        <Progress value={progressPotencial} className="h-2" />
      </div>
    </div>
  );
};
