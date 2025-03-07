
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatCurrency } from "@/lib/utils";

interface ClientOrderCardProps {
  clientName: string;
  data: any;
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
  const [localShowZeroBalance, setLocalShowZeroBalance] = useState(showZeroBalance);
  const [localShowOnlyWithStock, setLocalShowOnlyWithStock] = useState(showOnlyWithStock);
  
  const progressFaturamento = data.totalValorPedido > 0 
    ? (data.totalValorFaturado / data.totalValorPedido) * 100 
    : 0;
    
  const progressPotencial = data.totalValorSaldo > 0 
    ? (data.totalValorFaturarComEstoque / data.totalValorSaldo) * 100 
    : 0;
    
  const pedidosCount = new Set(data.allItems.map((item: any) => item.pedido)).size;

  const handleZeroBalanceChange = (checked: boolean) => {
    setLocalShowZeroBalance(checked);
  };

  const handleOnlyWithStockChange = (checked: boolean) => {
    setLocalShowOnlyWithStock(checked);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden",
        isExpanded && "col-span-full"
      )}
    >
      <CardContent className="p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Cliente: {clientName}</h3>
            {data.representante && (
              <p className="text-sm text-muted-foreground">
                Representante: {data.representante}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Total de Pedidos: {pedidosCount}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-6 w-6 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Faturamento</span>
                <span>{Math.round(progressFaturamento)}%</span>
              </div>
              <Progress value={progressFaturamento} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Potencial com Estoque</span>
                <span>{Math.round(progressPotencial)}%</span>
              </div>
              <Progress value={progressPotencial} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Quantidade Saldo:</p>
                <p className="font-medium">{data.totalQuantidadeSaldo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total Saldo:</p>
                <p className="font-medium">{formatCurrency(data.totalValorSaldo)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total do Pedido:</p>
                <p className="font-medium">{formatCurrency(data.totalValorPedido)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Faturado:</p>
                <p className="font-medium">{formatCurrency(data.totalValorFaturado)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturar com Estoque:</p>
                <p className="font-medium text-primary">{formatCurrency(data.totalValorFaturarComEstoque)}</p>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-6">
              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={localShowZeroBalance}
                    onCheckedChange={handleZeroBalanceChange}
                    id={`show-zero-balance-${clientName}`}
                    className="data-[state=checked]:bg-[#8B5CF6]"
                  />
                  <label 
                    htmlFor={`show-zero-balance-${clientName}`}
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Mostrar itens com saldo zero
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={localShowOnlyWithStock}
                    onCheckedChange={handleOnlyWithStockChange}
                    id={`show-only-with-stock-${clientName}`}
                    className="data-[state=checked]:bg-[#8B5CF6]"
                  />
                  <label 
                    htmlFor={`show-only-with-stock-${clientName}`}
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Mostrar apenas itens com estoque físico
                  </label>
                </div>
              </div>

              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2"></th>
                      <th className="text-left p-2">Pedido</th>
                      <th className="text-left p-2">SKU</th>
                      <th className="text-left p-2">Descrição</th>
                      <th className="text-right p-2">Qt. Pedida</th>
                      <th className="text-right p-2">Qt. Entregue</th>
                      <th className="text-right p-2">Qt. Saldo</th>
                      <th className="text-right p-2">Qt. Físico</th>
                      <th className="text-right p-2">Valor Unit.</th>
                      <th className="text-right p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.allItems
                      .filter((item: any) => {
                        if (!localShowZeroBalance && item.QTDE_SALDO <= 0) return false;
                        if (localShowOnlyWithStock && (item.FISICO || 0) <= 0) return false;
                        return true;
                      })
                      .map((item: any, index: number) => (
                      <tr 
                        key={`${item.pedido}-${item.ITEM_CODIGO}-${index}`} 
                        className={cn(
                          "border-t",
                          item.emSeparacao && "bg-[#FEF7CD]" // Fundo amarelo claro para itens em separação
                        )}
                      >
                        <td className="p-2">
                          <Checkbox
                            checked={selectedItems.includes(item.ITEM_CODIGO)}
                            onCheckedChange={() => onItemSelect(item)}
                            disabled={item.emSeparacao}
                          />
                        </td>
                        <td className="p-2">{item.pedido}</td>
                        <td className="p-2">{item.ITEM_CODIGO}</td>
                        <td className="p-2">
                          {item.DESCRICAO || '-'}
                          {item.emSeparacao && (
                            <span className="ml-2 text-amber-600 text-xs font-medium">
                              (Em separação)
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-right">{item.QTDE_PEDIDA}</td>
                        <td className="p-2 text-right">{item.QTDE_ENTREGUE}</td>
                        <td className="p-2 text-right">{item.QTDE_SALDO}</td>
                        <td className="p-2 text-right">{item.FISICO || '-'}</td>
                        <td className="p-2 text-right">
                          {formatCurrency(item.VALOR_UNITARIO)}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(item.QTDE_SALDO * item.VALOR_UNITARIO)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
