
import { Loader2, FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface SelectionSummaryProps {
  selectedItems: string[];
  totalSelecionado: number;
  isSending: boolean;
  onSendToSeparacao: () => void;
  onExportToExcel: () => void;
}

export const SelectionSummary = ({
  selectedItems,
  totalSelecionado,
  isSending,
  onSendToSeparacao,
  onExportToExcel
}: SelectionSummaryProps) => {
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <Card className="shadow-lg bg-white border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-1">
            <h4 className="font-medium text-sm">Resumo da seleção</h4>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Itens selecionados:</span>
              <span className="font-semibold">{selectedItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor total:</span>
              <span className="font-semibold text-primary">{formatCurrency(totalSelecionado)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-2">
        <Button
          onClick={onExportToExcel}
          variant="outline"
          className="bg-white text-primary border-primary hover:bg-primary/10"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar para Excel
        </Button>
        
        <Button
          onClick={onSendToSeparacao}
          disabled={isSending}
          className="bg-primary text-white shadow-lg hover:bg-primary/90"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            `Enviar ${selectedItems.length} itens para Separação`
          )}
        </Button>
      </div>
    </div>
  );
};
