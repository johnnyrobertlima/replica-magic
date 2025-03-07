
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ApprovedOrdersCockpitProps {
  valorTotal: number;
  quantidadeItens: number;
  quantidadePedidos: number;
}

export const ApprovedOrdersCockpit = ({ 
  valorTotal, 
  quantidadeItens, 
  quantidadePedidos 
}: ApprovedOrdersCockpitProps) => {
  // Simple chart data
  const chartData = [
    { name: 'Valor Aprovado', valor: valorTotal }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-white shadow-lg">
        <CardContent className="pt-6 p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Valor Total Aprovado</h3>
          <div className="text-3xl lg:text-4xl font-bold text-green-600">
            {formatCurrency(valorTotal)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-lg">
        <CardContent className="pt-6 p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Quantidade de Itens</h3>
          <div className="text-3xl lg:text-4xl font-bold text-primary">
            {quantidadeItens}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-lg">
        <CardContent className="pt-6 p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Pedidos Aprovados</h3>
          <div className="text-3xl lg:text-4xl font-bold text-primary">
            {quantidadePedidos}
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 md:col-span-3 bg-white shadow-lg">
        <CardContent className="pt-6 p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Visualização de Valor Aprovado</h3>
          <div className="h-80">
            <ChartContainer
              config={{
                valor: {
                  color: "#16a34a",
                },
              }}
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar 
                  dataKey="valor" 
                  fill="var(--color-valor, #16a34a)" 
                  name="Valor Aprovado" 
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
