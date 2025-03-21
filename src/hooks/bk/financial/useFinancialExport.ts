
import { useState } from "react";
import { FinancialTitle } from "@/services/bk/types/financialTypes";
import { ClientFinancialSummary } from "@/hooks/bk/financial/types";
import { exportToExcelWithSections } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";

interface UseFinancialExportProps {
  activeTab: string;
  clientFilteredTitles: FinancialTitle[];
  filteredInvoices: any[];
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
      let data = [];
      let fileName = 'relatorio-financeiro';
      
      switch (activeTab) {
        case 'titles':
          data = clientFilteredTitles.map(title => ({
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
          fileName = `titulos-financeiros-${new Date().toISOString().split('T')[0]}`;
          break;
          
        case 'invoices':
          data = filteredInvoices.map(invoice => ({
            'Nota Fiscal': invoice.NOTA || '',
            'Cliente': invoice.CLIENTE_NOME || '',
            'Data Emissão': invoice.DATA_EMISSAO || '',
            'Valor Total': invoice.VALOR_NOTA || 0,
            'Status': invoice.STATUS || ''
          }));
          fileName = `notas-fiscais-${new Date().toISOString().split('T')[0]}`;
          break;
          
        case 'clients':
          data = clientFinancialSummaries.map(client => ({
            'Código': client.PES_CODIGO,
            'Cliente': client.CLIENTE_NOME,
            'Valores Vencidos': client.totalValoresVencidos,
            'Valores Pagos': client.totalPago,
            'Valores em Aberto': client.totalEmAberto
          }));
          fileName = `resumo-clientes-${new Date().toISOString().split('T')[0]}`;
          break;
      }
      
      if (data.length > 0) {
        exportToExcelWithSections(
          [], 
          data, 
          fileName
        );
        
        toast({
          title: "Exportação Concluída",
          description: `${data.length} registros exportados com sucesso.`,
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
