
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { OrderList } from "@/components/jab-orders/OrderList";
import { ClientOrderGroup } from "@/types/clientOrders";
import { formatCurrency } from "@/lib/utils";

interface ClientOrderCardProps {
  clientName: string;
  data: ClientOrderGroup;
  isExpanded: boolean;
  onToggleExpand: () => void;
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  onItemSelect: (item: any) => void;
}

export const ClientOrderCard = ({
  clientName,
  data,
  isExpanded,
  onToggleExpand,
  showZeroBalance,
  showOnlyWithStock,
  selectedItems,
  onItemSelect
}: ClientOrderCardProps) => {
  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isExpanded ? "md:col-span-2" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{clientName}</CardTitle>
            <CardDescription className="space-y-1">
              {data.representanteNome && (
                <div>Representante: {data.representanteNome}</div>
              )}
              {data.valoresVencidos !== undefined && (
                <div>Valores Vencidos: {formatCurrency(data.valoresVencidos)}</div>
              )}
              {data.volumeSaudavel !== undefined && (
                <div>Volume Saudável: {data.volumeSaudavel ? formatCurrency(data.volumeSaudavel) : "Não definido"}</div>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Total Pedidos</span>
              <p className="font-medium">{formatCurrency(data.totalValorPedido)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Valor em Saldo</span>
              <p className="font-medium">{formatCurrency(data.totalValorSaldo)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Faturado</span>
              <p className="font-medium">{formatCurrency(data.totalValorFaturado)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Com Estoque</span>
              <p className="font-medium">{formatCurrency(data.totalValorFaturarComEstoque)}</p>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <OrderList
            orders={data.pedidos}
            showZeroBalance={showZeroBalance}
            showOnlyWithStock={showOnlyWithStock}
            selectedItems={selectedItems}
            onItemSelect={onItemSelect}
          />
        )}
      </CardContent>
    </Card>
  );
};
