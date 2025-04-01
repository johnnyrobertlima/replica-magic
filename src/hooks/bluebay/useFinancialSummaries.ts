
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
    // Remover a hora, minutos e segundos para comparar apenas as datas
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let totalValoresVencidos = 0;
    let totalPago = 0;
    let totalEmAberto = 0;
    
    // Calculate from titles, excluding canceled titles (status '4')
    filteredTitles
      .filter(title => title.STATUS !== '4') // Exclude canceled titles
      .forEach(title => {
        if (title.VLRSALDO > 0) {
          // Verifica se há data de vencimento e prepara para comparação
          let vencimentoDate = null;
          if (title.DTVENCIMENTO) {
            const vencimento = new Date(title.DTVENCIMENTO);
            vencimentoDate = new Date(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());
          }

          // Classificação dos títulos:
          // - Em aberto: data de vencimento é hoje ou no futuro
          // - Vencidos: data de vencimento é anterior a hoje
          if (!vencimentoDate || vencimentoDate < todayDateOnly) {
            totalValoresVencidos += title.VLRSALDO;
          } else {
            totalEmAberto += title.VLRSALDO;
          }
        }
        
        if (title.DTPAGTO) {
          totalPago += (title.VLRTITULO - (title.VLRSALDO || 0));
        }
      });
    
    // Calculate from invoices
    filteredInvoices.forEach(invoice => {
      // Para invoices, manteremos o cálculo anterior, pois podem não ter informação detalhada de vencimento
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
    // Remover a hora, minutos e segundos para comparar apenas as datas
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
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
          // Verifica se há data de vencimento e prepara para comparação
          let vencimentoDate = null;
          if (title.DTVENCIMENTO) {
            const vencimento = new Date(title.DTVENCIMENTO);
            vencimentoDate = new Date(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());
          }

          // Classificação dos títulos:
          // - Em aberto: data de vencimento é hoje ou no futuro
          // - Vencidos: data de vencimento é anterior a hoje
          if (!vencimentoDate || vencimentoDate < todayDateOnly) {
            clientSummary.totalValoresVencidos += title.VLRSALDO;
          } else {
            clientSummary.totalEmAberto += title.VLRSALDO;
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
      
      // Para invoices, manteremos o cálculo anterior, pois podem não ter informação detalhada de vencimento
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
