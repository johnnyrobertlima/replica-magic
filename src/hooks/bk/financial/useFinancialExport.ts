
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelUtils";
import { FinancialTitle } from "@/services/bk/types/financialTypes";
import { ConsolidatedInvoice } from "@/services/bk/types/financialTypes";
import { ClientFinancialSummary } from "@/hooks/bk/financial/types";

interface UseFinancialExportProps {
  activeTab: string;
  clientFilteredTitles: FinancialTitle[];
  filteredInvoices: ConsolidatedInvoice[];
  clientFinancialSummaries: ClientFinancialSummary[];
}

export const useFinancialExport = ({
  activeTab,
  clientFilteredTitles,
  filteredInvoices,
  clientFinancialSummaries
}: UseFinancialExportProps) => {
  const { toast } = useToast();

  const handleExportToExcel = () => {
    try {
      let exportData: any[] = [];
      let fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}`;

      // Different export logic based on the active tab
      if (activeTab === 'titles' || activeTab === 'all') {
        // Prepare titles data for export
        const titlesData = clientFilteredTitles.map(title => ({
          'Nota': title.NUMNOTA || '',
          'Cliente': title.CLIENTE_NOME || '',
          'Data Emissão': title.DTEMISSAO || '',
          'Data Vencimento': title.DTVENCIMENTO || '',
          'Data Pagamento': title.DTPAGTO || '',
          'Valor Título': title.VLRTITULO || 0,
          'Valor Desconto': title.VLRDESCONTO || 0,
          'Valor Saldo': title.VLRSALDO || 0,
          'Status': title.STATUS || ''
        }));
        
        exportData = [...exportData, ...titlesData];
      }

      if (activeTab === 'invoices' || activeTab === 'all') {
        // Prepare invoices data for export
        const invoicesData = filteredInvoices.map(invoice => ({
          'Nota': invoice.NOTA || '',
          'Cliente': invoice.CLIENTE_NOME || '',
          'Data Emissão': invoice.DATA_EMISSAO || '',
          'Valor': invoice.VALOR_NOTA || 0,
          'Status': invoice.STATUS || '',
          'Itens': invoice.ITEMS_COUNT || 0
        }));
        
        exportData = [...exportData, ...invoicesData];
      }

      if (activeTab === 'clients' || activeTab === 'all') {
        // Prepare client summaries data for export
        const clientSummaryData = clientFinancialSummaries.map(client => ({
          'Código': client.PES_CODIGO,
          'Cliente': client.CLIENTE_NOME,
          'Valores Vencidos': client.totalValoresVencidos,
          'Valores Pagos': client.totalPago,
          'Valores em Aberto': client.totalEmAberto
        }));
        
        exportData = [...exportData, ...clientSummaryData];
      }

      // Export the data to Excel
      if (exportData.length > 0) {
        exportToExcel(exportData, fileName);
        
        toast({
          title: "Exportação Concluída",
          description: `${exportData.length} registros exportados com sucesso.`,
        });
      } else {
        toast({
          title: "Nenhum dado para exportar",
          description: "Aplique filtros diferentes ou atualize os dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return { handleExportToExcel };
};
