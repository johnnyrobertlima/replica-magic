
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderItem } from "./types";

interface ClientOrderItemsProps {
  items: OrderItem[];
  showZeroBalance: boolean;
  onToggleZeroBalance: () => void;
  clientId: string;
}

const ClientOrderItems = ({ items, showZeroBalance, onToggleZeroBalance, clientId }: ClientOrderItemsProps) => {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Switch
            checked={showZeroBalance}
            onCheckedChange={onToggleZeroBalance}
            id={`show-zero-balance-${clientId}`}
          />
          <label 
            htmlFor={`show-zero-balance-${clientId}`}
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Mostrar itens com saldo zero
          </label>
        </div>
      </div>
      
      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-4">Itens Consolidados</h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">QT Pedido</TableHead>
                <TableHead className="text-right">QT Faturada</TableHead>
                <TableHead className="text-right">QT Saldo</TableHead>
                <TableHead className="text-right">VL Uni</TableHead>
                <TableHead className="text-right">VL Total Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items
                .filter(item => showZeroBalance || item.QTDE_SALDO > 0)
                .map((item, index) => (
                <TableRow key={`${item.ITEM_CODIGO}-${index}`}>
                  <TableCell>{item.PED_NUMPEDIDO}</TableCell>
                  <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                  <TableCell>{item.DESCRICAO || '-'}</TableCell>
                  <TableCell className="text-right">{item.QTDE_PEDIDA.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.QTDE_ENTREGUE.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.QTDE_SALDO.toLocaleString()}</TableCell>
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
  );
};

export default ClientOrderItems;
