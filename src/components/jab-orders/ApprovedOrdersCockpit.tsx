
import { Card, CardContent } from "@/components/ui/card";
import { StatCardsGrid } from "./cockpit/StatCardsGrid";
import { GaugeChart } from "./cockpit/GaugeChart";
import { BarChart } from "./cockpit/BarChart";

interface ApprovedOrdersCockpitProps {
  valorTotal: number;
  quantidadeItens: number;
  quantidadePedidos: number;
  valorFaltaFaturar: number;
  valorFaturado: number;
}

export const ApprovedOrdersCockpit = ({ 
  valorTotal, 
  quantidadeItens, 
  quantidadePedidos,
  valorFaltaFaturar,
  valorFaturado
}: ApprovedOrdersCockpitProps) => {
  return (
    <div className="space-y-6">
      <StatCardsGrid 
        valorTotal={valorTotal}
        valorFaturado={valorFaturado}
        valorFaltaFaturar={valorFaltaFaturar}
        quantidadePedidos={quantidadePedidos}
        quantidadeItens={quantidadeItens}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6 p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Progresso de Faturamento</h3>
            <GaugeChart 
              valorTotal={valorTotal}
              valorFaturado={valorFaturado}
              valorFaltaFaturar={valorFaltaFaturar}
            />
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6 p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Comparativo de Valores</h3>
            <BarChart 
              valorTotal={valorTotal}
              valorFaturado={valorFaturado}
              valorFaltaFaturar={valorFaltaFaturar}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
