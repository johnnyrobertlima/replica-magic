
import { useToast } from "@/components/ui/use-toast";
import { exportGroupedDataToExcel } from "@/utils/excelUtils";
import { EstoqueItem, GroupedEstoque } from "@/types/bk/estoque";

export const useEstoqueExport = () => {
  const { toast } = useToast();

  const handleExportEstoque = (groupedItems: GroupedEstoque[], filteredItems: EstoqueItem[]) => {
    try {
      if (filteredItems.length === 0) {
        toast({
          title: "Nenhum dado para exportar",
          description: "Não existem itens com estoque para exportar.",
          variant: "destructive",
        });
        return;
      }

      // Create a structure for grouped data export
      const exportData: Record<string, any[]> = {};

      groupedItems.forEach(group => {
        // Create array of items for this group
        const items = group.items.map(item => ({
          'Código': item.ITEM_CODIGO,
          'Descrição': item.DESCRICAO,
          'Físico': Number(item.FISICO),
          'Disponível': Number(item.DISPONIVEL),
          'Reservado': Number(item.RESERVADO),
          'Sublocalização': item.SUBLOCAL || '-'
        }));

        // Add group data to export structure
        exportData[group.groupName] = items;
      });

      // Generate filename with current date
      const fileName = `estoque-local1-${new Date().toISOString().split('T')[0]}`;
      
      // Export to Excel
      const exportedRows = exportGroupedDataToExcel(exportData, fileName);
      
      if (exportedRows > 0) {
        toast({
          title: "Exportação concluída",
          description: `Dados de ${filteredItems.length} itens em ${groupedItems.length} grupos exportados com sucesso.`,
        });
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return { handleExportEstoque };
};
