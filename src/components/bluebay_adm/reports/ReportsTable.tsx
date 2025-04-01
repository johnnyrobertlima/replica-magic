
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { ItemDetailsTable } from "./ItemDetailsTable";

interface ReportsTableProps {
  items: any[];
  isLoading: boolean;
  onItemClick: (itemCode: string) => void;
  selectedItemDetails: any;
  isLoadingDetails: boolean;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ 
  items, 
  isLoading, 
  onItemClick,
  selectedItemDetails,
  isLoadingDetails
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum item encontrado para o período selecionado.</p>
      </div>
    );
  }

  // Group items by grupo
  const groupedItems = items.reduce((acc, item) => {
    const grupo = item.GRU_DESCRICAO || 'Sem Grupo';
    if (!acc[grupo]) {
      acc[grupo] = [];
    }
    acc[grupo].push(item);
    return acc;
  }, {});

  // Sort groups by total value
  const sortedGroups = Object.keys(groupedItems).sort((a, b) => {
    const totalA = groupedItems[a].reduce((sum, item) => sum + item.TOTAL_VALOR, 0);
    const totalB = groupedItems[b].reduce((sum, item) => sum + item.TOTAL_VALOR, 0);
    return totalB - totalA;
  });

  return (
    <div className="space-y-6">
      {sortedGroups.map(grupo => {
        const groupItems = groupedItems[grupo];
        const groupTotal = groupItems.reduce((sum, item) => sum + item.TOTAL_VALOR, 0);
        const groupQuantity = groupItems.reduce((sum, item) => sum + item.TOTAL_QUANTIDADE, 0);
        
        return (
          <div key={grupo} className="border rounded-md overflow-hidden">
            <div className="bg-muted p-3 font-medium flex justify-between items-center">
              <div>
                <span>{grupo}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({groupItems.length} itens)
                </span>
              </div>
              <div className="flex space-x-4 text-sm">
                <span>Quantidade: {groupQuantity.toLocaleString()}</span>
                <span>Total: {formatCurrency(groupTotal)}</span>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Ocorrências</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupItems.map((item) => {
                  const isSelected = selectedItemDetails?.itemCode === item.ITEM_CODIGO;
                  
                  return (
                    <React.Fragment key={item.ITEM_CODIGO}>
                      <TableRow 
                        className={isSelected ? "bg-muted/50" : undefined}
                      >
                        <TableCell className="font-mono">{item.ITEM_CODIGO}</TableCell>
                        <TableCell>{item.DESCRICAO}</TableCell>
                        <TableCell className="text-right">{item.TOTAL_QUANTIDADE.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.TOTAL_VALOR)}</TableCell>
                        <TableCell className="text-right">{item.OCORRENCIAS}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onItemClick(item.ITEM_CODIGO)}
                          >
                            {isSelected ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {isSelected && (
                        <TableRow>
                          <TableCell colSpan={6} className="p-0 border-t-0">
                            <div className="bg-muted/30 p-4">
                              <ItemDetailsTable 
                                details={selectedItemDetails.details} 
                                isLoading={isLoadingDetails} 
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
};
