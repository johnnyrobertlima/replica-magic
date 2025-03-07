
import { StatCards } from "./cockpit/StatCards";
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
  // Calculate percentage for gauge
  const percentFaturado = valorTotal > 0 ? (valorFaturado / valorTotal) * 100 : 0;
  
  return (
    <div className="space-y-6">
      <StatCards 
        valorTotal={valorTotal}
        valorFaturado={valorFaturado}
        valorFaltaFaturar={valorFaltaFaturar}
        quantidadePedidos={quantidadePedidos}
        quantidadeItens={quantidadeItens}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GaugeChart 
          valorTotal={valorTotal}
          valorFaturado={valorFaturado}
          valorFaltaFaturar={valorFaltaFaturar}
          percentFaturado={percentFaturado}
        />
        
        <BarChart 
          valorTotal={valorTotal}
          valorFaturado={valorFaturado}
          valorFaltaFaturar={valorFaltaFaturar}
        />
      </div>
    </div>
  );
};
