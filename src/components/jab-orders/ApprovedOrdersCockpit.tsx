
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";

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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-white shadow-lg border-l-4 border-l-green-600">
          <CardContent className="pt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Valor Total Aprovado</h3>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(valorTotal)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg border-l-4 border-l-blue-600">
          <CardContent className="pt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Valor Faturado</h3>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(valorFaturado)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg border-l-4 border-l-amber-600">
          <CardContent className="pt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Falta Faturar</h3>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(valorFaltaFaturar)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg border-l-4 border-l-purple-600">
          <CardContent className="pt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pedidos Aprovados</h3>
            <div className="text-2xl font-bold text-purple-600">
              {quantidadePedidos}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg border-l-4 border-l-indigo-600">
          <CardContent className="pt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Quantidade de Itens</h3>
            <div className="text-2xl font-bold text-indigo-600">
              {quantidadeItens}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white shadow-lg">
        <CardContent className="pt-6 p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Comparativo de Valores</h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <div className="cockpit-container w-full max-w-[600px]">
              {/* Semi-circular gauge with racing dashboard styling */}
              <div className="bg-gray-100 rounded-t-full pt-4 pb-0 px-8 border-2 border-gray-300 relative">
                {/* Gauge numbers */}
                <div className="flex justify-between mb-2 px-4">
                  <span className="text-xs text-gray-500">0</span>
                  <span className="text-xs text-gray-500">25%</span>
                  <span className="text-xs text-gray-500">50%</span>
                  <span className="text-xs text-gray-500">75%</span>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
                
                {/* Main gauge part */}
                <div className="relative h-32">
                  {/* Background gauge */}
                  <div className="absolute bottom-0 w-full bg-gray-200 h-32 rounded-t-full overflow-hidden border border-gray-300">
                    {/* Gauge section markers */}
                    <div className="flex h-full">
                      <div className="w-1/4 h-full border-r border-gray-300"></div>
                      <div className="w-1/4 h-full border-r border-gray-300"></div>
                      <div className="w-1/4 h-full border-r border-gray-300"></div>
                      <div className="w-1/4 h-full"></div>
                    </div>
                  </div>
                  
                  {/* Colored gauge segments */}
                  <div className="absolute bottom-0 w-full h-32 rounded-t-full overflow-hidden">
                    <div className="h-full flex">
                      <div className="w-1/4 h-full bg-red-400 opacity-70"></div>
                      <div className="w-1/4 h-full bg-yellow-400 opacity-70"></div>
                      <div className="w-1/4 h-full bg-green-400 opacity-70"></div>
                      <div className="w-1/4 h-full bg-blue-400 opacity-70"></div>
                    </div>
                  </div>
                  
                  {/* Gauge pointer/needle */}
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 origin-bottom rotate-[-90deg]" 
                    style={{ 
                      transform: `translateX(-50%) rotate(${(percentFaturado * 1.8) - 90}deg)`,
                      transition: 'transform 1s ease-out'
                    }}
                  >
                    <div className="w-1 h-28 bg-gray-800 rounded-t-full"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-800 -mt-0.5 -ml-1.5"></div>
                  </div>
                </div>
                
                {/* Digital display */}
                <div className="my-4 p-2 bg-black text-green-400 font-mono rounded text-center border-2 border-gray-700">
                  <div className="text-sm">Valor Faturado</div>
                  <div className="text-lg font-bold">{formatCurrency(valorFaturado)}</div>
                  <div className="text-xs opacity-75">de {formatCurrency(valorTotal)}</div>
                </div>
                
                {/* Percentage display */}
                <div className="flex justify-center mb-4">
                  <div className="px-4 py-1 bg-gray-200 rounded-full border border-gray-300">
                    <span className="font-bold">{percentFaturado.toFixed(1)}%</span>
                  </div>
                </div>
                
                {/* Progress bar at bottom */}
                <div className="mb-4">
                  <Progress value={percentFaturado} className="h-2" />
                </div>
              </div>
              
              {/* Dashboard controls area */}
              <div className="bg-gray-700 py-3 px-6 rounded-b-lg border-x-2 border-b-2 border-gray-300 flex justify-between">
                <div className="text-white text-sm">
                  <div>Valor Total: {formatCurrency(valorTotal)}</div>
                </div>
                <div className="text-white text-sm">
                  <div>Falta Faturar: {formatCurrency(valorFaltaFaturar)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
