
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientGroup } from "./types";
import { OrderProgress } from "@/components/jab-orders/OrderProgress";
import OrderCard from "@/components/jab-orders/OrderCard";

interface ClientOrderCardProps {
  clientGroup: ClientGroup;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const ClientOrderCard = ({ clientGroup }: ClientOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showZeroBalanceMap, setShowZeroBalanceMap] = useState<Record<string, boolean>>({});

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const toggleShowZeroBalance = (orderId: string) => {
    setShowZeroBalanceMap(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all cursor-pointer",
        isExpanded && "col-span-full"
      )}
      onClick={toggleExpand}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">
              {clientGroup.clienteNome || "Cliente não identificado"}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {clientGroup.pedidos.length} pedido(s)
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <OrderProgress
          valorTotalPedido={clientGroup.valorTotal + clientGroup.valorFaturado}
          valorFaturado={clientGroup.valorFaturado}
          valorFaturarComEstoque={clientGroup.valorFaturarComEstoque}
          valor_total={clientGroup.valorTotal}
        />
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Quantidade Total Saldo:</span>
            <span className="font-medium">{clientGroup.totalSaldo.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Valor Total Saldo:</span>
            <span className="font-medium">{formatCurrency(clientGroup.valorTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Valor Total Faturado:</span>
            <span className="font-medium">{formatCurrency(clientGroup.valorFaturado)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-sm text-muted-foreground">Faturar com Estoque:</span>
            <span className="font-medium text-primary">{formatCurrency(clientGroup.valorFaturarComEstoque)}</span>
          </div>

          {isExpanded && (
            <div className="mt-6 space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Pedidos do Cliente</h3>
              <div className="grid gap-4">
                {clientGroup.pedidos.map((order) => {
                  const orderId = `${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
                  const isOrderExpanded = expandedOrder === orderId;
                  const showZeroBalance = showZeroBalanceMap[orderId] || false;

                  return (
                    <OrderCard
                      key={orderId}
                      order={order}
                      isExpanded={isOrderExpanded}
                      showZeroBalance={showZeroBalance}
                      onToggleExpand={() => toggleOrderExpand(orderId)}
                      onToggleZeroBalance={() => toggleShowZeroBalance(orderId)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
