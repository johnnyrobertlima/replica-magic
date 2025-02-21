
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface OrderCardProps {
  order: {
    MATRIZ: number;
    FILIAL: number;
    PED_NUMPEDIDO: string;
    PED_ANOBASE: number;
    STATUS: string;
    APELIDO: string | null;
    PEDIDO_CLIENTE?: string | null;
    total_saldo: number;
    valor_total: number;
    items?: Array<{
      ITEM_CODIGO: string;
      DESCRICAO: string | null;
      QTDE_PEDIDA: number;
      QTDE_ENTREGUE: number;
      QTDE_SALDO: number;
      VALOR_UNITARIO: number;
      FISICO: number | null;
    }>;
  };
  isExpanded: boolean;
  showZeroBalance: boolean;
  onToggleExpand: () => void;
  onToggleZeroBalance: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isExpanded,
  showZeroBalance,
  onToggleExpand,
  onToggleZeroBalance,
}) => {
  const [showOnlyWithStock, setShowOnlyWithStock] = useState(false);

  const getStatusText = (status: string) => {
    switch (status) {
      case "1":
        return "Aberto";
      case "2":
        return "Parcial";
      default:
        return "ERRO";
    }
  };

  const calculateTotalFaturarComEstoque = () => {
    if (!order.items) return 0;
    return order.items.reduce((total, item) => {
      if ((item.FISICO || 0) > 0) {
        return total + (item.QTDE_SALDO * item.VALOR_UNITARIO);
      }
      return total;
    }, 0);
  };

  const orderId = `${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all cursor-pointer",
        isExpanded && "ring-2 ring-primary col-span-full"
      )}
      onClick={onToggleExpand}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">
              Pedido #{order.PED_NUMPEDIDO}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Status: {getStatusText(order.STATUS)}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Ano Base: {order.PED_ANOBASE}
        </p>
        {order.APELIDO && (
          <p className="text-sm text-muted-foreground">
            Cliente: {order.APELIDO}
          </p>
        )}
        {order.PEDIDO_CLIENTE && (
          <p className="text-sm text-muted-foreground">
            Pedido do Cliente: {order.PEDIDO_CLIENTE}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Quantidade Saldo:</span>
            <span className="font-medium">{order.total_saldo.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Valor Total:</span>
            <span className="font-medium">
              R$ {order.valor_total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-sm text-muted-foreground">Faturar com Estoque:</span>
            <span className="font-medium text-primary">
              R$ {calculateTotalFaturarComEstoque().toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          
          {isExpanded && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showZeroBalance}
                      onCheckedChange={onToggleZeroBalance}
                      id={`show-zero-balance-${orderId}`}
                    />
                    <label 
                      htmlFor={`show-zero-balance-${orderId}`} 
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Mostrar itens com saldo zero
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showOnlyWithStock}
                      onCheckedChange={setShowOnlyWithStock}
                      id={`show-only-with-stock-${orderId}`}
                    />
                    <label 
                      htmlFor={`show-only-with-stock-${orderId}`} 
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Somente com estoque
                    </label>
                  </div>
                </div>
                <span className="text-sm font-semibold">Filial: {order.FILIAL}</span>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-4">Itens do Pedido</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">QT Pedido</TableHead>
                        <TableHead className="text-right">QT Faturada</TableHead>
                        <TableHead className="text-right">QT Saldo</TableHead>
                        <TableHead className="text-right">QT Físico</TableHead>
                        <TableHead className="text-right">VL Uni</TableHead>
                        <TableHead className="text-right">VL Total Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items
                        ?.filter(item => {
                          if (!showZeroBalance && item.QTDE_SALDO <= 0) return false;
                          if (showOnlyWithStock && (item.FISICO || 0) <= 0) return false;
                          return true;
                        })
                        .map((item, index) => (
                        <TableRow key={`${item.ITEM_CODIGO}-${index}`}>
                          <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                          <TableCell>{item.DESCRICAO || '-'}</TableCell>
                          <TableCell className="text-right">{item.QTDE_PEDIDA.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.QTDE_ENTREGUE.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.QTDE_SALDO.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.FISICO?.toLocaleString() || '-'}</TableCell>
                          <TableCell className="text-right">
                            {item.VALOR_UNITARIO.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {(item.QTDE_SALDO * item.VALOR_UNITARIO).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
