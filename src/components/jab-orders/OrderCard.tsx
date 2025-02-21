
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { JabOrder } from '@/hooks/useJabOrders';

interface OrderCardProps {
  order: JabOrder;
  isExpanded: boolean;
  showZeroBalance: boolean;
  onToggleExpand: () => void;
  onToggleZeroBalance: () => void;
}

const OrderCard = ({ order, isExpanded, showZeroBalance, onToggleExpand, onToggleZeroBalance }: OrderCardProps) => {
  const hasItems = order.items?.length > 0;
  const filteredItems = showZeroBalance 
    ? order.items 
    : order.items.filter(item => item.QTDE_SALDO > 0);

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Pedido: {order.PED_NUMPEDIDO}
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              Cliente: {order.APELIDO || 'N/A'}
            </p>
            {order.REPRESENTANTE_NOME && (
              <p className="text-sm text-muted-foreground mb-1">
                Representante: {order.REPRESENTANTE_NOME}
              </p>
            )}
            {order.PEDIDO_CLIENTE && (
              <p className="text-sm text-muted-foreground">
                Pedido Cliente: {order.PEDIDO_CLIENTE}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(order.valor_total)}
            </p>
            <p className="text-sm text-muted-foreground">
              Total Saldo: {order.total_saldo}
            </p>
          </div>
        </div>

        {hasItems && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleZeroBalance}
                className="text-xs"
              >
                {showZeroBalance ? 'Ocultar Saldo Zero' : 'Mostrar Saldo Zero'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="text-primary"
              >
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>

            {isExpanded && (
              <div className="space-y-2 mt-4">
                <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <div>Código</div>
                  <div>Descrição</div>
                  <div className="text-right">Saldo</div>
                  <div className="text-right">Estoque</div>
                </div>
                {filteredItems.map((item) => (
                  <div 
                    key={item.ITEM_CODIGO} 
                    className="grid grid-cols-4 gap-2 text-sm border-t py-2"
                  >
                    <div>{item.ITEM_CODIGO}</div>
                    <div>{item.DESCRICAO || 'N/A'}</div>
                    <div className="text-right">{item.QTDE_SALDO}</div>
                    <div className="text-right">{item.FISICO || 0}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
