
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatCurrency } from "@/lib/utils";

interface OrderItem {
  pedido?: string;
  ITEM_CODIGO?: string;
  item_codigo?: string;
  DESCRICAO?: string | null;
  descricao?: string | null;
  QTDE_PEDIDA?: number;
  qtde_pedida?: number;
  QTDE_ENTREGUE?: number;
  qtde_entregue?: number;
  QTDE_SALDO?: number;
  qtde_saldo?: number;
  FISICO?: number | null;
  fisico?: number | null;
  VALOR_UNITARIO?: number;
  valor_unitario?: number;
  emSeparacao?: boolean;
}

interface ClientOrderItemsTableProps {
  items: OrderItem[];
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  onItemSelect: (item: any) => void;
}

export const ClientOrderItemsTable = ({
  items,
  showZeroBalance,
  showOnlyWithStock,
  selectedItems,
  onItemSelect
}: ClientOrderItemsTableProps) => {
  console.log('ClientOrderItemsTable received items:', items);
  console.log('showZeroBalance:', showZeroBalance);
  console.log('showOnlyWithStock:', showOnlyWithStock);
  
  // Helper function to access property regardless of case
  const getProperty = (item: OrderItem, upperProp: string, lowerProp: string): any => {
    return item[upperProp as keyof OrderItem] !== undefined 
      ? item[upperProp as keyof OrderItem] 
      : item[lowerProp as keyof OrderItem];
  };
  
  // Log the first few items with their qtde_saldo values to debug filtering
  if (items && items.length > 0) {
    console.log('Sample items with QTDE_SALDO/qtde_saldo values:');
    items.slice(0, 5).forEach((item, index) => {
      const itemCode = getProperty(item, 'ITEM_CODIGO', 'item_codigo');
      const desc = getProperty(item, 'DESCRICAO', 'descricao');
      const saldo = getProperty(item, 'QTDE_SALDO', 'qtde_saldo');
      const fisico = getProperty(item, 'FISICO', 'fisico');
      
      console.log(`Item ${index}:`, {
        itemCode,
        desc,
        saldo,
        fisico,
        type_saldo: typeof saldo
      });
    });
  }
  
  // Safely filter items, ensuring all items have the required properties
  const filteredItems = (items || []).filter((item) => {
    if (!item || typeof item !== 'object') {
      console.log('Filtering out item that is not an object');
      return false;
    }
    
    // Get saldo and fisico values using helper function
    const saldo = Number(getProperty(item, 'QTDE_SALDO', 'qtde_saldo')) || 0;
    const fisico = Number(getProperty(item, 'FISICO', 'fisico')) || 0;
    
    // Check for QTDE_SALDO value
    if (!showZeroBalance && saldo <= 0) {
      console.log(`Filtering out item due to zero balance: ${saldo}`);
      return false;
    }
    
    // Check for FISICO value
    if (showOnlyWithStock && fisico <= 0) {
      console.log(`Filtering out item due to no stock: ${fisico}`);
      return false;
    }
    
    return true;
  });
  
  console.log('Filtered items count:', filteredItems.length);
  console.log('First 3 filtered items sample:', filteredItems.slice(0, 3));
  
  // Debug selected items
  console.log('Currently selected items:', selectedItems);

  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-2"></th>
            <th className="text-left p-2">Pedido</th>
            <th className="text-left p-2">SKU</th>
            <th className="text-left p-2">Descrição</th>
            <th className="text-right p-2">Solicitado</th>
            <th className="text-right p-2">Entregue</th>
            <th className="text-right p-2">Saldo</th>
            <th className="text-right p-2">Qt. Físico</th>
            <th className="text-right p-2">Valor Unit.</th>
            <th className="text-right p-2">Falta Faturar</th>
            <th className="text-right p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const itemCode = getProperty(item, 'ITEM_CODIGO', 'item_codigo');
              const desc = getProperty(item, 'DESCRICAO', 'descricao');
              const qtdePedida = Number(getProperty(item, 'QTDE_PEDIDA', 'qtde_pedida')) || 0;
              const qtdeEntregue = Number(getProperty(item, 'QTDE_ENTREGUE', 'qtde_entregue')) || 0;
              const qtdeSaldo = Number(getProperty(item, 'QTDE_SALDO', 'qtde_saldo')) || 0;
              const valorUnitario = Number(getProperty(item, 'VALOR_UNITARIO', 'valor_unitario')) || 0;
              const fisico = getProperty(item, 'FISICO', 'fisico');
              const pedido = getProperty(item, 'pedido', 'PED_NUMPEDIDO') || '-';
              const emSeparacao = item.emSeparacao || false;
              
              const faltaFaturarValue = qtdeSaldo * valorUnitario;
              const isSelected = selectedItems.includes(itemCode);
              
              // Create a unique key that combines pedido and itemCode for the row
              const rowKey = `${pedido}-${itemCode}-${index}`;
              
              // Log when checkbox is clicked
              const handleCheckboxChange = () => {
                console.log(`Checkbox clicked for item: ${itemCode}, was selected: ${isSelected}`);
                onItemSelect(item);
              };
              
              return (
                <tr 
                  key={rowKey} 
                  className={cn(
                    "border-t",
                    emSeparacao && "bg-[#FEF7CD]" // Fundo amarelo claro para itens em separação
                  )}
                >
                  <td className="p-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={handleCheckboxChange}
                      disabled={emSeparacao}
                      id={`checkbox-${itemCode}-${index}`}
                    />
                  </td>
                  <td className="p-2">{pedido || '-'}</td>
                  <td className="p-2">{itemCode || '-'}</td>
                  <td className="p-2">
                    {desc || '-'}
                    {emSeparacao && (
                      <span className="ml-2 text-amber-600 text-xs font-medium">
                        (Em separação)
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-right">{qtdePedida}</td>
                  <td className="p-2 text-right">{qtdeEntregue}</td>
                  <td className="p-2 text-right">{qtdeSaldo}</td>
                  <td className="p-2 text-right">{fisico ?? '-'}</td>
                  <td className="p-2 text-right">
                    {formatCurrency(valorUnitario)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(faltaFaturarValue)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(faltaFaturarValue)}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={11} className="text-center py-4">
                Nenhum item encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
