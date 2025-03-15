
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ReportsTableHeader } from "./ReportsTableHeader";
import { ItemDetailsTable } from "./ItemDetailsTable";
import { SearchBar } from "../financial/SearchBar";

interface ItemReport {
  ITEM_CODIGO: string;
  DESCRICAO?: string;
  TOTAL_QUANTIDADE: number;
  TOTAL_VALOR: number;
  OCORRENCIAS: number;
}

interface ReportsTableProps {
  items: ItemReport[];
  isLoading: boolean;
  onItemClick: (itemCode: string) => void;
  selectedItemDetails: any[];
  isLoadingDetails: boolean;
}

export const ReportsTable = ({ 
  items, 
  isLoading, 
  onItemClick,
  selectedItemDetails,
  isLoadingDetails
}: ReportsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("ITEM_CODIGO");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleItemClick = async (itemCode: string) => {
    if (selectedItem === itemCode) {
      setSelectedItem(null);
      return;
    }

    setSelectedItem(itemCode);
    onItemClick(itemCode);
  };

  const filteredItems = items.filter((item) => {
    return (
      item.ITEM_CODIGO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.DESCRICAO?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortField === "TOTAL_VALOR") {
      const valueA = a.TOTAL_VALOR || 0;
      const valueB = b.TOTAL_VALOR || 0;
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }
    
    if (sortField === "TOTAL_QUANTIDADE") {
      const valueA = a.TOTAL_QUANTIDADE || 0;
      const valueB = b.TOTAL_QUANTIDADE || 0;
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }
    
    if (sortField === "OCORRENCIAS") {
      const valueA = a.OCORRENCIAS || 0;
      const valueB = b.OCORRENCIAS || 0;
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }
    
    // Default string comparison
    const valueA = String(a[sortField] || "");
    const valueB = String(b[sortField] || "");
    return sortDirection === "asc" 
      ? valueA.localeCompare(valueB) 
      : valueB.localeCompare(valueA);
  });

  if (isLoading) {
    return (
      <div className="w-full py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por código ou descrição do item..."
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableCaption>Lista de itens - Total: {sortedItems.length}</TableCaption>
          <ReportsTableHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhum item encontrado
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
                <React.Fragment key={item.ITEM_CODIGO}>
                  <TableRow 
                    className={selectedItem === item.ITEM_CODIGO ? "bg-muted" : "cursor-pointer"}
                    onClick={() => handleItemClick(item.ITEM_CODIGO)}
                  >
                    <TableCell>
                      {selectedItem === item.ITEM_CODIGO ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </TableCell>
                    <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                    <TableCell>{item.DESCRICAO || '-'}</TableCell>
                    <TableCell className="text-right">{item.TOTAL_QUANTIDADE}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.TOTAL_VALOR)}
                    </TableCell>
                    <TableCell className="text-right">{item.OCORRENCIAS}</TableCell>
                  </TableRow>
                  {selectedItem === item.ITEM_CODIGO && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30 p-0">
                        <div className="px-4 py-2">
                          <h4 className="font-medium mb-2">Detalhes do Item {item.ITEM_CODIGO}</h4>
                          <ItemDetailsTable 
                            itemDetails={selectedItemDetails}
                            isLoadingDetails={isLoadingDetails}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
