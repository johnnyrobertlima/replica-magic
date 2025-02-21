
import { Card, CardContent } from "@/components/ui/card";

interface TotalCardsProps {
  valorTotalSaldo: number;
  valorFaturarComEstoque: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const TotalCards = ({ valorTotalSaldo, valorFaturarComEstoque }: TotalCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="bg-white shadow-lg">
        <CardContent className="pt-6 p-8">
          <div className="text-xl font-semibold text-gray-700 mb-2">Valor Total Saldo</div>
          <div className="text-3xl lg:text-4xl font-bold text-primary">
            {formatCurrency(valorTotalSaldo)}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-lg">
        <CardContent className="pt-6 p-8">
          <div className="text-xl font-semibold text-gray-700 mb-2">Faturar com Estoque</div>
          <div className="text-3xl lg:text-4xl font-bold text-primary">
            {formatCurrency(valorFaturarComEstoque)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
