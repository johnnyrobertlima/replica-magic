
import { useState, useCallback, useMemo } from "react";
import { ConsolidatedInvoice, FinancialTitle } from "@/services/bk/types/financialTypes";
import { ClientFinancialSummary } from "./types";

export const useFinancialFilters = (
  consolidatedInvoices: ConsolidatedInvoice[],
  financialTitles: FinancialTitle[],
  clientFinancialSummaries: ClientFinancialSummary[]
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
        invoice.CLIENTE_NOME?.toLowerCase().includes(searchTerm)
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
        title.CLIENTE_NOME?.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }, [statusFilter, clientFilter, financialTitles]);

  // Filter client summaries
  const filterClientSummaries = useCallback(() => {
    if (!clientFilter) {
      return clientFinancialSummaries;
    }
    
    const searchTerm = clientFilter.toLowerCase();
    return clientFinancialSummaries.filter(summary => 
      summary.CLIENTE_NOME.toLowerCase().includes(searchTerm)
    );
  }, [clientFilter, clientFinancialSummaries]);

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
    filteredTitles,
    filterClientSummaries
  };
};
