
import { useState, useEffect } from "react";
import { ConsolidatedInvoice } from "@/services/bk/types/financialTypes";
import { FinancialSummary, ClientFinancialSummary } from "./types";
import { isAfter, isBefore, isEqual, parseISO } from "date-fns";

export const useFinancialSummaries = (
  filteredInvoices: ConsolidatedInvoice[]
) => {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalValoresVencidos: 0,
    totalPago: 0,
    totalEmAberto: 0
  });
  
  const [clientFinancialSummaries, setClientFinancialSummaries] = useState<ClientFinancialSummary[]>([]);

  // Calculate financial summaries whenever filtered invoices change
  useEffect(() => {
    // Calculate overall financial summary
    const today = new Date();
    let totalPago = 0;
    let totalEmAberto = 0;
    let totalValoresVencidos = 0;

    // Client summaries calculation
    const clientSummaries = new Map<string, ClientFinancialSummary>();

    filteredInvoices.forEach(invoice => {
      const emissaoDate = invoice.DATA_EMISSAO ? parseISO(invoice.DATA_EMISSAO) : null;
      const valorNota = invoice.VALOR_NOTA || 0;
      
      // Update totals based on status
      if (invoice.STATUS === 'Pago') {
        totalPago += valorNota;
      } else {
        totalEmAberto += valorNota;
        
        // Check if overdue (simplified logic - actual overdue would depend on terms)
        if (emissaoDate && (isBefore(emissaoDate, today) || isEqual(emissaoDate, today))) {
          totalValoresVencidos += valorNota;
        }
      }
      
      // Update client summaries
      if (invoice.PES_CODIGO && invoice.CLIENTE_NOME) {
        const pesCode = String(invoice.PES_CODIGO);
        const clientName = invoice.CLIENTE_NOME;
        
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
        
        if (invoice.STATUS === 'Pago') {
          clientSummary.totalPago += valorNota;
        } else {
          clientSummary.totalEmAberto += valorNota;
          
          // Check if overdue for client
          if (emissaoDate && (isBefore(emissaoDate, today) || isEqual(emissaoDate, today))) {
            clientSummary.totalValoresVencidos += valorNota;
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
  }, [filteredInvoices]);

  return {
    financialSummary,
    clientFinancialSummaries
  };
};
