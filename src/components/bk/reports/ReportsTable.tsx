
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableRow
} from "@/components/ui/table";
import { exportToExcel } from "@/utils/excelUtils";
import { ReportsTableHeader } from "./ReportsTableHeader";
import { ReportTableActions } from "./ReportTableActions";
import { ReportGroupHeader } from "./ReportGroupHeader";
import { ReportItemRow } from "./ReportItemRow";
import { ReportEmptyState } from "./ReportEmptyState";
import { ReportLoadingState } from "./ReportLoadingState";
import { useReportData } from "./useReportData";
import { ItemReport } from "@/services/bluebay/types";

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
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    groupedItems,
    groupTotals,
    expandedGroups,
    toggleGroup,
    sortedItems
  } = useReportData(items);

  const handleItemClick = async (itemCode: string) => {
    if (selectedItem === itemCode) {
      setSelectedItem(null);
      return;
    }

    setSelectedItem(itemCode);
    onItemClick(itemCode);
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
    return <ReportLoadingState />;
  }

  return (
    <div className="space-y-4">
      <ReportTableActions 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExportExcel={handleExportExcel}
      />
      
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
              <ReportEmptyState />
            ) : (
              <>
                {Object.entries(groupedItems).map(([groupName, items]) => (
                  <React.Fragment key={groupName}>
                    {/* Group Header Row */}
                    <ReportGroupHeader 
                      groupName={groupName}
                      itemCount={items.length}
                      isExpanded={expandedGroups.has(groupName)}
                      toggleGroup={toggleGroup}
                      quantities={groupTotals[groupName]}
                    />
                    
                    {/* Group Items (expanded) */}
                    {expandedGroups.has(groupName) && items.map((item) => (
                      <ReportItemRow 
                        key={item.ITEM_CODIGO}
                        item={item}
                        selectedItem={selectedItem}
                        handleItemClick={handleItemClick}
                        selectedItemDetails={selectedItemDetails}
                        isLoadingDetails={isLoadingDetails}
                      />
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
