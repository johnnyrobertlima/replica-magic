
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { BkMenu } from "@/components/bk/BkMenu";
import { useEstoqueData } from "@/hooks/bk/useEstoqueData";
import { useEstoqueExport } from "@/hooks/bk/useEstoqueExport";
import { EstoqueSearchFilter } from "@/components/bk/estoque/EstoqueSearchFilter";
import { EstoqueSummaryCards } from "@/components/bk/estoque/EstoqueSummaryCards";
import { EstoqueItemList } from "@/components/bk/estoque/EstoqueItemList";

const BkEstoque = () => {
  const { filteredItems, groupedItems, isLoading, searchTerm, setSearchTerm } = useEstoqueData();
  const { handleExportEstoque } = useEstoqueExport();

  const handleExportClick = () => {
    handleExportEstoque(groupedItems, filteredItems);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BkMenu />

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Gestão de Estoque</h1>
          <Button 
            variant="outline" 
            onClick={handleExportClick}
            disabled={isLoading || filteredItems.length === 0}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

        <EstoqueSearchFilter 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />

        {!isLoading && filteredItems.length > 0 && (
          <EstoqueSummaryCards 
            groupedItems={groupedItems} 
            filteredItems={filteredItems} 
          />
        )}

        <EstoqueItemList 
          isLoading={isLoading} 
          groupedItems={groupedItems} 
          searchTerm={searchTerm} 
        />
      </div>
    </div>
  );
};

export default BkEstoque;
