
import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConsolidatedInvoice, FinancialTitle } from "./useFinancialData";
import { ClientFinancialSummary } from "./useFinancialFilters";

interface UseFinancialExportParams {
  activeTab: string;
  filteredTitles: FinancialTitle[];
  filteredInvoices: ConsolidatedInvoice[];
  clientFinancialSummaries: ClientFinancialSummary[];
}

export const useFinancialExport = ({
  activeTab,
  filteredTitles,
  filteredInvoices,
  clientFinancialSummaries
}: UseFinancialExportParams) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportToExcel = useCallback(() => {
    setIsExporting(true);
    try {
      let data: any[] = [];
      let filename = "financeiro-bluebay";
      
      switch (activeTab) {
        case "titles":
          // Format and map titles data for Excel
          data = filteredTitles.map(title => ({
            "Número da Nota": title.NUMNOTA,
            "Cliente": title.CLIENTE_NOME,
            "Código do Cliente": title.PES_CODIGO,
            "Data de Emissão": title.DTEMISSAO ? format(new Date(title.DTEMISSAO), 'dd/MM/yyyy', { locale: ptBR }) : '',
            "Data de Vencimento": title.DTVENCIMENTO ? format(new Date(title.DTVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) : '',
            "Data de Pagamento": title.DTPAGTO ? format(new Date(title.DTPAGTO), 'dd/MM/yyyy', { locale: ptBR }) : '',
            "Valor do Título": title.VLRTITULO,
            "Valor de Desconto": title.VLRDESCONTO,
            "Valor Saldo": title.VLRSALDO,
            "Status": title.STATUS
          }));
          filename = "titulos-financeiros-bluebay";
          break;
          
        case "invoices":
          // Format and map invoices data for Excel
          data = filteredInvoices.map(invoice => ({
            "Nota": invoice.NOTA,
            "Cliente": invoice.CLIENTE_NOME,
            "Código do Cliente": invoice.PES_CODIGO,
            "Data de Emissão": invoice.DATA_EMISSAO ? format(new Date(invoice.DATA_EMISSAO), 'dd/MM/yyyy', { locale: ptBR }) : '',
            "Valor da Nota": invoice.VALOR_NOTA,
            "Valor Pago": invoice.VALOR_PAGO,
            "Valor Saldo": invoice.VALOR_SALDO,
            "Status": invoice.STATUS
          }));
          filename = "notas-fiscais-bluebay";
          break;
          
        case "clients":
          // Format and map client summaries data for Excel
          data = clientFinancialSummaries.map(client => ({
            "Cliente": client.CLIENTE_NOME,
            "Código do Cliente": client.PES_CODIGO,
            "Valores em Aberto": client.totalEmAberto,
            "Valores Vencidos": client.totalValoresVencidos,
            "Valores Pagos": client.totalPago,
            "Total": client.totalEmAberto + client.totalPago
          }));
          filename = "clientes-financeiro-bluebay";
          break;
      }
      
      if (data.length > 0) {
        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
        
        // Generate file name with date
        const dateStr = format(new Date(), 'dd-MM-yyyy', { locale: ptBR });
        const fullFilename = `${filename}-${dateStr}.xlsx`;
        
        // Write and download Excel file
        XLSX.writeFile(workbook, fullFilename);
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsExporting(false);
    }
  }, [activeTab, filteredTitles, filteredInvoices, clientFinancialSummaries]);

  return {
    isExporting,
    handleExportToExcel
  };
};
