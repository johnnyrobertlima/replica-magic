
interface OrderSelectionSummaryProps {
  selectedItems: string[];
  totalSaldo: number;
  totalValor: number;
}

export const OrderSelectionSummary = ({
  selectedItems,
  totalSaldo,
  totalValor
}: OrderSelectionSummaryProps) => {
  if (selectedItems.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-card text-card-foreground p-4 rounded-lg shadow-lg border">
      <p className="text-sm font-medium">Itens Selecionados: {selectedItems.length}</p>
      <p className="text-sm">Total Saldo: {totalSaldo}</p>
      <p className="text-sm">Valor Total: {totalValor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })}</p>
    </div>
  );
};
