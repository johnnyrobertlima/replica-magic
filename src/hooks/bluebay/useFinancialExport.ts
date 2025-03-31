
import { useState, useCallback } from "react";
import { utils, writeFile } from 'xlsx';
import { FinancialTitle } from "./types/financialTypes";
import { ClientFinancialSummary } from "./useFinancialFilters";
import { differenceInDays } from "date-fns";

interface UseFinancialExportProps {
  activeTab: string;
  filteredTitles: FinancialTitle[];
  filteredInvoices: any[];
  clientFinancialSummaries: ClientFinancialSummary[];
}

export const useFinancialExport = ({
  activeTab,
  filteredTitles,
  filteredInvoices,
  clientFinancialSummaries
}: UseFinancialExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString || '';
    }
  };

  const handleExportToExcel = useCallback(() => {
    setIsExporting(true);
    
    try {
      let data: any[] = [];
      let fileName = 'financeiro_bluebay';
      
      // Export based on active tab
      if (activeTab === 'titles') {
        data = filteredTitles.map(title => ({
          'Nota Fiscal': title.NUMNOTA,
          'Nº Documento': title.NUMDOCUMENTO || '',
          'Cliente': title.CLIENTE_NOME,
          'Data Emissão': formatDate(title.DTEMISSAO),
          'Data Vencimento': formatDate(title.DTVENCIMENTO),
          'Data Pagamento': formatDate(title.DTPAGTO),
          'Valor Desconto': title.VLRDESCONTO,
          'Valor Título': title.VLRTITULO,
          'Valor Saldo': title.VLRSALDO,
          'Status': title.STATUS === '1' ? 'Em Aberto' :
                   title.STATUS === '2' ? 'Parcial' :
                   title.STATUS === '3' ? 'Pago' :
                   title.STATUS === '4' ? 'Cancelado' : title.STATUS
        }));
        fileName = 'titulos_financeiros';
      } 
      else if (activeTab === 'invoices') {
        data = filteredInvoices.map(invoice => ({
          'Nota Fiscal': invoice.NOTA,
          'Cliente': invoice.CLIENTE_NOME,
          'Data Emissão': formatDate(invoice.DATA_EMISSAO),
          'Data Vencimento': formatDate(invoice.DATA_VENCIMENTO),
          'Valor Nota': invoice.VALOR_NOTA,
          'Valor Pago': invoice.VALOR_PAGO,
          'Valor Saldo': invoice.VALOR_SALDO,
          'Status': invoice.STATUS
        }));
        fileName = 'notas_fiscais';
      }
      else if (activeTab === 'clients') {
        data = clientFinancialSummaries.map(client => ({
          'Código': client.PES_CODIGO,
          'Cliente': client.CLIENTE_NOME,
          'Valores Vencidos': client.totalValoresVencidos,
          'Valores em Aberto': client.totalEmAberto,
          'Valores Pagos': client.totalPago,
          'Total': client.totalEmAberto + client.totalPago
        }));
        fileName = 'clientes_resumo';
      }
      else if (activeTab === 'clientesVencidos') {
        // Filter only overdue titles (DTVENCIMENTO < today)
        const today = new Date();
        const overdueTitles = filteredTitles.filter(title => {
          const vencimentoDate = title.DTVENCIMENTO ? new Date(title.DTVENCIMENTO) : null;
          const isPaid = title.STATUS === '3'; // Status 3 = Paid
          const isCanceled = title.STATUS === '4'; // Status 4 = Canceled
          return vencimentoDate && vencimentoDate < today && !isPaid && !isCanceled;
        });
        
        // Group by client
        const clientOverdueMap = new Map<string | number, any>();
        
        overdueTitles.forEach(title => {
          const clientKey = String(title.PES_CODIGO);
          if (!clientOverdueMap.has(clientKey)) {
            clientOverdueMap.set(clientKey, {
              PES_CODIGO: title.PES_CODIGO,
              CLIENTE_NOME: title.CLIENTE_NOME,
              QUANTIDADE_TITULOS: 0,
              TOTAL_VALOR: 0
            });
          }
          
          const clientData = clientOverdueMap.get(clientKey);
          clientData.QUANTIDADE_TITULOS += 1;
          clientData.TOTAL_VALOR += title.VLRSALDO;
        });
        
        data = Array.from(clientOverdueMap.values()).map(client => ({
          'Código': client.PES_CODIGO,
          'Cliente': client.CLIENTE_NOME,
          'Quantidade Títulos Vencidos': client.QUANTIDADE_TITULOS,
          'Valor Total Vencido': client.TOTAL_VALOR
        }));
        
        fileName = 'clientes_titulos_vencidos';
      }
      else if (activeTab === 'cobranca') {
        // Filter only overdue titles (DTVENCIMENTO < today and STATUS is not "paid")
        const today = new Date();
        const overdueUnpaidTitles = filteredTitles.filter(title => {
          const isPaid = title.STATUS === '3'; // Status 3 = Paid
          const isCanceled = title.STATUS === '4'; // Status 4 = Canceled
          const vencimentoDate = title.DTVENCIMENTO ? new Date(title.DTVENCIMENTO) : null;
          const isOverdue = vencimentoDate && vencimentoDate < today;
          
          return !isPaid && !isCanceled && isOverdue && title.VLRSALDO > 0;
        });
        
        // Group by client
        const clientSummaries: Record<string | number, any> = {};
        
        overdueUnpaidTitles.forEach(title => {
          const clientKey = String(title.PES_CODIGO);
          
          if (!clientSummaries[clientKey]) {
            clientSummaries[clientKey] = {
              PES_CODIGO: title.PES_CODIGO,
              CLIENTE_NOME: title.CLIENTE_NOME,
              TOTAL_SALDO: 0,
              DIAS_VENCIDO_MEDIO: 0,
              QUANTIDADE_TITULOS: 0,
              VALOR_TOTAL: 0,
              titulos: []
            };
          }
          
          const summary = clientSummaries[clientKey];
          summary.TOTAL_SALDO += title.VLRSALDO;
          summary.VALOR_TOTAL += title.VLRTITULO;
          summary.QUANTIDADE_TITULOS++;
          
          // Calculate days overdue
          if (title.DTVENCIMENTO) {
            const vencimentoDate = new Date(title.DTVENCIMENTO);
            const diasVencido = differenceInDays(today, vencimentoDate);
            summary.DIAS_VENCIDO_MEDIO += diasVencido;
            
            // Add title details
            summary.titulos.push({
              NUMNOTA: title.NUMNOTA,
              NUMDOCUMENTO: title.NUMDOCUMENTO || '',
              DTEMISSAO: formatDate(title.DTEMISSAO),
              DTVENCIMENTO: formatDate(title.DTVENCIMENTO),
              DIAS_VENCIDO: diasVencido,
              VLRTITULO: title.VLRTITULO,
              VLRSALDO: title.VLRSALDO,
              STATUS: title.STATUS === '1' ? 'Em Aberto' :
                      title.STATUS === '2' ? 'Parcial' :
                      title.STATUS === '3' ? 'Pago' :
                      title.STATUS === '4' ? 'Cancelado' : title.STATUS
            });
          }
        });
        
        // Calculate average days overdue
        Object.values(clientSummaries).forEach(summary => {
          if (summary.QUANTIDADE_TITULOS > 0) {
            summary.DIAS_VENCIDO_MEDIO = Math.round(summary.DIAS_VENCIDO_MEDIO / summary.QUANTIDADE_TITULOS);
          }
        });
        
        // Create workbook with two sheets: client summary and detailed titles
        const workbook = utils.book_new();
        
        // Create summary sheet
        const summaryCols = [
          'Código', 'Cliente', 'Qtd. Títulos', 'Dias Vencidos (média)', 
          'Valor Total', 'Valor Saldo'
        ];
        
        const summaryData = Object.values(clientSummaries).map(summary => ({
          'Código': summary.PES_CODIGO,
          'Cliente': summary.CLIENTE_NOME,
          'Qtd. Títulos': summary.QUANTIDADE_TITULOS,
          'Dias Vencidos (média)': summary.DIAS_VENCIDO_MEDIO,
          'Valor Total': summary.VALOR_TOTAL,
          'Valor Saldo': summary.TOTAL_SALDO
        }));
        
        const summarySheet = utils.json_to_sheet(summaryData, { 
          header: summaryCols
        });
        
        // Create details sheet
        const detailsCols = [
          'Cliente', 'Nota Fiscal', 'Nº Documento', 'Data Emissão',
          'Data Vencimento', 'Dias Vencido', 'Valor Total', 'Valor Saldo', 'Status'
        ];
        
        const detailsData: any[] = [];
        Object.values(clientSummaries).forEach(summary => {
          summary.titulos.forEach((titulo: any) => {
            detailsData.push({
              'Cliente': summary.CLIENTE_NOME,
              'Nota Fiscal': titulo.NUMNOTA,
              'Nº Documento': titulo.NUMDOCUMENTO,
              'Data Emissão': titulo.DTEMISSAO,
              'Data Vencimento': titulo.DTVENCIMENTO,
              'Dias Vencido': titulo.DIAS_VENCIDO,
              'Valor Total': titulo.VLRTITULO,
              'Valor Saldo': titulo.VLRSALDO,
              'Status': titulo.STATUS
            });
          });
        });
        
        const detailsSheet = utils.json_to_sheet(detailsData, { 
          header: detailsCols
        });
        
        // Add sheets to workbook
        utils.book_append_sheet(workbook, summarySheet, 'Resumo por Cliente');
        utils.book_append_sheet(workbook, detailsSheet, 'Detalhes dos Títulos');
        
        // Export workbook
        writeFile(workbook, 'cobranca_clientes.xlsx');
        return;
      }
      
      // Create worksheet and workbook (for tabs other than cobranca)
      const worksheet = utils.json_to_sheet(data);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
      // Export to file
      writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  }, [activeTab, filteredTitles, filteredInvoices, clientFinancialSummaries]);

  return { handleExportToExcel, isExporting };
};
