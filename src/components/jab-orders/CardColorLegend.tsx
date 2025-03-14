
import { AlertCircle, CheckCircle, InfoIcon } from "lucide-react";

export const CardColorLegend = () => {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm my-6">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
        <InfoIcon className="h-4 w-4" />
        Status dos Clientes
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-green-500 rounded"></div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              Sem valores vencidos e valores em aberto &lt; R$ 5.000
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-amber-500 rounded"></div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-sm">
              Sem valores vencidos e valores em aberto &gt; R$ 5.000
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-red-500 rounded"></div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm">
              Valores vencidos &gt; 0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
