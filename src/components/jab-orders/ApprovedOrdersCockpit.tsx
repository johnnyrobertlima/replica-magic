import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

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
  // Chart data with all metrics
  const chartData = [
    { name: 'Valor Aprovado', valor: valorTotal },
    { name: 'Valor Faturado', valor: valorFaturado },
    { name: 'Falta Faturar', valor: valorFaltaFaturar }
  ];

  // Function to get color based on data name
  const getBarColor = (entry: any) => {
    const name = entry?.name;
    if (name === 'Valor Aprovado') return "#16a34a";
    if (name === 'Valor Faturado') return "#2563eb";
    if (name === 'Falta Faturar') return "#d97706";
    return "#16a34a"; // Default
  };

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
          <div className="h-[100px] w-full">
            <ChartContainer
              config={{
                valor: {
                  color: "#16a34a", // Green for approved
                },
              }}
            >
              <div style={{ width: '100%', height: '100%' }}>
                <BarChart 
                  data={chartData}
                  margin={{ top: 0, right: 30, left: 30, bottom: 30 }}
                  height={100}
                  width={500}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    domain={[0, 'auto']} 
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar 
                    dataKey="valor" 
                    name="Valor" 
                    fill="#16a34a" 
                    radius={[4, 4, 0, 0]} 
                    isAnimationActive={true}
                  >
                    {chartData.map((entry, index) => (
                      <rect key={`rect-${index}`} fill={getBarColor(entry)} />
                    ))}
                  </Bar>
                </BarChart>
              </div>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
