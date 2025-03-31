
import { useState, useCallback, useMemo } from "react";
import { ConsolidatedInvoice, FinancialTitle } from "./types/financialTypes";

export interface ClientFinancialSummary {
  PES_CODIGO: string | number;
  CLIENTE_NOME: string;
  totalValoresVencidos: number;
  totalPago: number;
  totalEmAberto: number;
}

export const useFinancialFilters = (
  consolidatedInvoices: ConsolidatedInvoice[],
  financialTitles: FinancialTitle[]
) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("");
  const [notaFilter, setNotaFilter] = useState<string>("");

  // Apply filters for invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...consolidatedInvoices];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.STATUS === statusFilter);
    }
    
    // Apply client filter
    if (clientFilter) {
      const searchTerm = clientFilter.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.CLIENTE_NOME?.toLowerCase().includes(searchTerm) ||
        String(invoice.PES_CODIGO).includes(searchTerm)
      );
    }
    
    // Apply nota filter
    if (notaFilter) {
      filtered = filtered.filter(invoice => 
        invoice.NOTA.includes(notaFilter)
      );
    }
    
    return filtered;
  }, [statusFilter, clientFilter, notaFilter, consolidatedInvoices]);

  // Apply filters for titles
  const filteredTitles = useMemo(() => {
    let filtered = [...financialTitles];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(title => title.STATUS === statusFilter);
    }
    
    // Apply client filter
    if (clientFilter) {
      const searchTerm = clientFilter.toLowerCase();
      filtered = filtered.filter(title => 
        title.CLIENTE_NOME?.toLowerCase().includes(searchTerm) ||
        String(title.PES_CODIGO).includes(searchTerm)
      );
    }
    
    // Apply nota filter (this was missing)
    if (notaFilter) {
      filtered = filtered.filter(title => 
        String(title.NUMNOTA).includes(notaFilter)
      );
    }
    
    return filtered;
  }, [statusFilter, clientFilter, notaFilter, financialTitles]);

  const updateStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  const updateClientFilter = useCallback((client: string) => {
    setClientFilter(client);
  }, []);

  const updateNotaFilter = useCallback((nota: string) => {
    setNotaFilter(nota);
  }, []);

  return {
    statusFilter,
    updateStatusFilter,
    clientFilter,
    updateClientFilter,
    notaFilter,
    updateNotaFilter,
    filteredInvoices,
    filteredTitles
  };
};
