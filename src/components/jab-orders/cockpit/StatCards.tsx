
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatCardsProps {
  valorTotal: number;
  valorFaturado: number;
  valorFaltaFaturar: number;
  quantidadePedidos: number;
  quantidadeItens: number;
}

export const StatCards = ({
  valorTotal,
  valorFaturado,
  valorFaltaFaturar,
  quantidadePedidos,
  quantidadeItens
}: StatCardsProps) => {
  return (
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
  );
};
