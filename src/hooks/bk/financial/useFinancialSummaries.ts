
import { useState, useEffect } from "react";
import { ConsolidatedInvoice, FinancialTitle } from "@/services/bk/types/financialTypes";
import { FinancialSummary, ClientFinancialSummary } from "./types";
import { isAfter, isBefore, isEqual, parseISO } from "date-fns";

export const useFinancialSummaries = (
  filteredInvoices: ConsolidatedInvoice[],
  filteredTitles: FinancialTitle[] = []
) => {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalValoresVencidos: 0,
    totalPago: 0,
    totalEmAberto: 0
  });
  
  const [clientFinancialSummaries, setClientFinancialSummaries] = useState<ClientFinancialSummary[]>([]);

  // Calculate financial summaries from titles whenever filtered titles change
  useEffect(() => {
    // Calculate overall financial summary
    const today = new Date();
    let totalPago = 0;
    let totalEmAberto = 0;
    let totalValoresVencidos = 0;

    // Client summaries calculation
    const clientSummaries = new Map<string, ClientFinancialSummary>();

    // Process titles
    filteredTitles.forEach(title => {
      const vencimentoDate = title.DTVENCIMENTO ? parseISO(title.DTVENCIMENTO) : null;
      const vlrTitulo = title.VLRTITULO || 0;
      const vlrSaldo = title.VLRSALDO || 0;
      
      // Check if title is paid
      if (title.STATUS === '3') { // Status 3 = Pago
        totalPago += vlrTitulo;
      } else {
        // Add to total open amount if not paid
        totalEmAberto += vlrSaldo;
        
        // Check if overdue (vencimento date is in the past)
        if (vencimentoDate && isBefore(vencimentoDate, today)) {
          totalValoresVencidos += vlrSaldo;
        }
      }
      
      // Update client summaries
      if (title.PES_CODIGO && title.CLIENTE_NOME) {
        const pesCode = String(title.PES_CODIGO);
        const clientName = title.CLIENTE_NOME;
        
        if (!clientSummaries.has(pesCode)) {
          clientSummaries.set(pesCode, {
            PES_CODIGO: pesCode,
            CLIENTE_NOME: clientName,
            totalValoresVencidos: 0,
            totalPago: 0,
            totalEmAberto: 0
          });
        }
        
        const clientSummary = clientSummaries.get(pesCode)!;
        
        if (title.STATUS === '3') { // Status 3 = Pago
          clientSummary.totalPago += vlrTitulo;
        } else {
          clientSummary.totalEmAberto += vlrSaldo;
          
          // Check if overdue for client
          if (vencimentoDate && isBefore(vencimentoDate, today)) {
            clientSummary.totalValoresVencidos += vlrSaldo;
          }
        }
      }
    });

    setFinancialSummary({
      totalValoresVencidos,
      totalPago,
      totalEmAberto
    });
    
    setClientFinancialSummaries(Array.from(clientSummaries.values()));
  }, [filteredTitles]);

  return {
    financialSummary,
    clientFinancialSummaries
  };
};
