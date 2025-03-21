
import React, { useState, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableRow,
  TableHead
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { ReportsTableHeader } from "./ReportsTableHeader";
import { ItemDetailsTable } from "./ItemDetailsTable";
import { SearchBar } from "../financial/SearchBar";
import { exportToExcel } from "@/utils/excelUtils";

interface ItemReport {
  ITEM_CODIGO: string;
  DESCRICAO?: string;
  GRU_DESCRICAO?: string;
  TOTAL_QUANTIDADE: number;
  TOTAL_VALOR: number;
  OCORRENCIAS: number;
}

interface GroupedItems {
  [groupName: string]: ItemReport[];
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      return (
        item.ITEM_CODIGO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.DESCRICAO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.GRU_DESCRICAO?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [items, searchTerm]);

  // Sort filtered items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
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
  }, [filteredItems, sortField, sortDirection]);

  // Group items by GRU_DESCRICAO
  const groupedItems = useMemo(() => {
    const groups: GroupedItems = {};
    
    sortedItems.forEach(item => {
      const groupName = item.GRU_DESCRICAO || 'Sem Grupo';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    });
    
    return groups;
  }, [sortedItems]);

  // Calculate group totals
  const groupTotals = useMemo(() => {
    const totals: Record<string, { quantidade: number; valor: number; ocorrencias: number }> = {};
    
    Object.entries(groupedItems).forEach(([groupName, items]) => {
      totals[groupName] = items.reduce((acc, item) => {
        return {
          quantidade: acc.quantidade + item.TOTAL_QUANTIDADE,
          valor: acc.valor + item.TOTAL_VALOR,
          ocorrencias: acc.ocorrencias + item.OCORRENCIAS
        };
      }, { quantidade: 0, valor: 0, ocorrencias: 0 });
    });
    
    return totals;
  }, [groupedItems]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleExportExcel = () => {
    // Prepare data for export
    const exportData = sortedItems.map(item => ({
      "Código": item.ITEM_CODIGO,
      "Descrição": item.DESCRICAO || '',
      "Grupo": item.GRU_DESCRICAO || 'Sem Grupo',
      "Quantidade Total": item.TOTAL_QUANTIDADE,
      "Valor Total": item.TOTAL_VALOR,
      "Ocorrências": item.OCORRENCIAS,
    }));
    
    exportToExcel(exportData, "relatorio-itens");
  };

  if (isLoading) {
    return (
      <div className="w-full py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por código, descrição ou grupo do item..."
        />
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleExportExcel}
        >
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableCaption>Lista de itens - Total: {sortedItems.length}</TableCaption>
          <ReportsTableHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
            showGroup={true}
          />
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Nenhum item encontrado
                </TableCell>
              </TableRow>
            ) : (
              <>
                {Object.entries(groupedItems).map(([groupName, items]) => (
                  <React.Fragment key={groupName}>
                    {/* Group Header Row */}
                    <TableRow 
                      className="bg-muted/30 font-medium cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleGroup(groupName)}
                    >
                      <TableCell>
                        {expandedGroups.has(groupName) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </TableCell>
                      <TableCell colSpan={2} className="font-semibold">
                        {groupName} ({items.length} itens)
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {groupTotals[groupName].quantidade}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(groupTotals[groupName].valor)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {groupTotals[groupName].ocorrencias}
                      </TableCell>
                    </TableRow>
                    
                    {/* Group Items (expanded) */}
                    {expandedGroups.has(groupName) && items.map((item) => (
                      <React.Fragment key={item.ITEM_CODIGO}>
                        <TableRow 
                          className={selectedItem === item.ITEM_CODIGO ? "bg-muted" : "cursor-pointer"}
                          onClick={() => handleItemClick(item.ITEM_CODIGO)}
                        >
                          <TableCell>
                            {selectedItem === item.ITEM_CODIGO ? 
                              <ChevronDown className="h-4 w-4 ml-4" /> : 
                              <ChevronRight className="h-4 w-4 ml-4" />
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
                    ))}
                  </React.Fragment>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
