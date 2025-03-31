
import { useMemo } from "react";
import { ConsolidatedInvoice, FinancialTitle } from "./types/financialTypes";
import { ClientFinancialSummary } from "./useFinancialFilters";

export interface FinancialSummary {
  totalValoresVencidos: number;
  totalPago: number; 
  totalEmAberto: number;
}

export const useFinancialSummaries = (
  filteredInvoices: ConsolidatedInvoice[],
  filteredTitles: FinancialTitle[]
) => {
  // Calculate financial summary
  const financialSummary = useMemo(() => {
    const today = new Date();
    
    let totalValoresVencidos = 0;
    let totalPago = 0;
    let totalEmAberto = 0;
    
    // Calculate from titles, excluding canceled titles (status '4')
    filteredTitles
      .filter(title => title.STATUS !== '4') // Exclude canceled titles
      .forEach(title => {
        if (title.VLRSALDO > 0) {
          totalEmAberto += title.VLRSALDO;
          
          // Check if overdue
          if (title.DTVENCIMENTO) {
            const vencimento = new Date(title.DTVENCIMENTO);
            if (vencimento < today) {
              totalValoresVencidos += title.VLRSALDO;
            }
          }
        }
        
        if (title.DTPAGTO) {
          totalPago += (title.VLRTITULO - (title.VLRSALDO || 0));
        }
      });
    
    // Calculate from invoices
    filteredInvoices.forEach(invoice => {
      totalEmAberto += invoice.VALOR_SALDO || 0;
      totalPago += invoice.VALOR_PAGO || 0;
    });
    
    return {
      totalValoresVencidos,
      totalPago,
      totalEmAberto
    };
  }, [filteredInvoices, filteredTitles]);

  // Group by client for client summaries, excluding canceled titles
  const clientFinancialSummaries = useMemo(() => {
    const today = new Date();
    const clientMap = new Map<string | number, ClientFinancialSummary>();
    
    // Process titles, excluding canceled titles (status '4')
    filteredTitles
      .filter(title => title.STATUS !== '4') // Exclude canceled titles
      .forEach(title => {
        const clientKey = title.PES_CODIGO;
        
        if (!clientMap.has(clientKey)) {
          clientMap.set(clientKey, {
            PES_CODIGO: clientKey,
            CLIENTE_NOME: title.CLIENTE_NOME,
            totalValoresVencidos: 0,
            totalPago: 0,
            totalEmAberto: 0
          });
        }
        
        const clientSummary = clientMap.get(clientKey)!;
        
        if (title.VLRSALDO > 0) {
          clientSummary.totalEmAberto += title.VLRSALDO;
          
          // Check if overdue
          if (title.DTVENCIMENTO) {
            const vencimento = new Date(title.DTVENCIMENTO);
            if (vencimento < today) {
              clientSummary.totalValoresVencidos += title.VLRSALDO;
            }
          }
        }
        
        if (title.DTPAGTO) {
          clientSummary.totalPago += (title.VLRTITULO - (title.VLRSALDO || 0));
        }
      });
    
    // Process invoices
    filteredInvoices.forEach(invoice => {
      const clientKey = invoice.PES_CODIGO;
      
      if (!clientMap.has(clientKey)) {
        clientMap.set(clientKey, {
          PES_CODIGO: clientKey,
          CLIENTE_NOME: invoice.CLIENTE_NOME,
          totalValoresVencidos: 0,
          totalPago: 0,
          totalEmAberto: 0
        });
      }
      
      const clientSummary = clientMap.get(clientKey)!;
      
      clientSummary.totalEmAberto += invoice.VALOR_SALDO || 0;
      clientSummary.totalPago += invoice.VALOR_PAGO || 0;
    });
    
    return Array.from(clientMap.values());
  }, [filteredInvoices, filteredTitles]);

  return {
    financialSummary,
    clientFinancialSummaries
  };
};
