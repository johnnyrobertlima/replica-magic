
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { DateRange, FinancialTitle, ConsolidatedInvoice } from "./types/financialTypes";
import { fetchClientData } from "./utils/clientDataUtils";
import { createConsolidatedInvoice, updateInvoiceWithTitles } from "./utils/invoiceUtils";
import { processFinancialTitle } from "./utils/titleUtils";

export type { FinancialTitle, ConsolidatedInvoice } from "./types/financialTypes";

export const useFinancialData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [consolidatedInvoices, setConsolidatedInvoices] = useState<ConsolidatedInvoice[]>([]);
  const [financialTitles, setFinancialTitles] = useState<FinancialTitle[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1000; // Fetch a large batch to avoid frequent pagination

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.info("useFinanciero effect - triggering data refresh");
      
      // Format dates for database filtering
      const startDateFormatted = dateRange.startDate 
        ? format(dateRange.startDate, 'yyyy-MM-dd') 
        : null;
      
      const endDateFormatted = dateRange.endDate
        ? format(dateRange.endDate, 'yyyy-MM-dd')
        : null;

      console.log(`Date range for filtering: ${startDateFormatted} to ${endDateFormatted}`);
      
      // Prepare the base query for BLUEBAY_TITULO
      let tituloQuery = supabase
        .from('BLUEBAY_TITULO')
        .select('*', { count: 'exact' });
      
      // Apply date filters if both dates are provided
      if (startDateFormatted && endDateFormatted) {
        // Handle timestamp format with special care for PostgreSQL compatibility
        // Use date range that includes titles with:
        // 1. DTVENCIMENTO within the range
        // 2. DTVENCIMENTO is null (to avoid missing important data)
        tituloQuery = tituloQuery.or(`DTVENCIMENTO.gte.${startDateFormatted},DTVENCIMENTO.lte.${endDateFormatted},DTVENCIMENTO.is.null`);
      }
      
      // Add pagination
      tituloQuery = tituloQuery
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      
      // Execute query
      const { data: allTitulos, error: allTitulosError, count } = await tituloQuery;
      
      if (allTitulosError) {
        console.error("Error fetching all titles:", allTitulosError);
        throw allTitulosError;
      }
      
      // Update total count for pagination if available
      if (count !== null) {
        setTotalCount(count);
      }
      
      console.info(`Fetched ${allTitulos?.length || 0} total titles for BLUEBAY (page ${currentPage}, from ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalCount || 0)})`);
      console.info(`Total count: ${count}`);
      
      // Process titles
      const processedTitulos = allTitulos || [];
      
      // Collect all unique client codes for these titles
      const clienteCodigos = [...new Set(
        processedTitulos.map(titulo => 
          typeof titulo.PES_CODIGO === 'string' ? 
            titulo.PES_CODIGO : String(titulo.PES_CODIGO)
        )
      )].filter(Boolean) as Array<string | number>;
      
      console.info(`Found ${clienteCodigos.length} unique client codes in titles`);
      
      // Fetch client data - now returns Record<string | number, ClientInfo> instead of Map
      const clientesMap = await fetchClientData(clienteCodigos);
      
      // Process titles with client names
      const processedTitles = processedTitulos.map(titulo => 
        processFinancialTitle(titulo, clientesMap)
      );
      
      setFinancialTitles(processedTitles);
      
      // Collect unique statuses for filter
      const uniqueStatuses = [...new Set([
        ...processedTitles.map(title => title.STATUS || "").filter(Boolean)
      ])];
      
      setAvailableStatuses(['all', ...uniqueStatuses]);
      
      // Fetch billing data for BLUEBAY cost center
      let faturamentoQuery = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*');
      
      // Apply date filters to faturamento if needed
      if (startDateFormatted && endDateFormatted) {
        faturamentoQuery = faturamentoQuery.or(`DATA_EMISSAO.gte.${startDateFormatted},DATA_EMISSAO.lte.${endDateFormatted},DATA_EMISSAO.is.null`);
      }
      
      const { data: faturamento, error: faturamentoError } = await faturamentoQuery;
      
      if (faturamentoError) {
        console.error("Error fetching invoices:", faturamentoError);
      } else {
        console.info(`Fetched ${faturamento?.length || 0} invoices for BLUEBAY`);
        
        // Process invoices
        const consolidatedData: ConsolidatedInvoice[] = [];
        
        if (faturamento && faturamento.length > 0) {
          for (const item of faturamento) {
            const invoice = createConsolidatedInvoice(item, clientesMap);
            
            // Find corresponding titles for this invoice
            const matchingTitles = processedTitulos.filter(titulo => 
              String(titulo.NUMNOTA) === String(item.NOTA)) || [];
            
            // Set due date of the title if available
            if (matchingTitles.length > 0) {
              invoice.DATA_VENCIMENTO = matchingTitles[0].DTVENCIMENTO || 
                matchingTitles[0].DTVENCTO || null;
            }
            
            consolidatedData.push(invoice);
          }
          
          // Update invoice values based on related titles
          for (const titulo of processedTitulos) {
            // Find the related invoice
            const invoice = consolidatedData.find(inv => 
              String(inv.NOTA) === String(titulo.NUMNOTA));
            
            if (invoice) {
              updateInvoiceWithTitles(invoice, titulo);
            }
          }
        }
        
        setConsolidatedInvoices(consolidatedData);
      }
      
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, currentPage, pageSize, totalCount]);

  const updateDateRange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
    // Reset pagination when date range changes
    setCurrentPage(1);
  }, []);

  const goToNextPage = useCallback(() => {
    if (currentPage * pageSize < totalCount) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, pageSize, totalCount]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  return {
    isLoading,
    consolidatedInvoices,
    financialTitles,
    availableStatuses,
    dateRange,
    updateDateRange,
    refreshData,
    pagination: {
      currentPage,
      totalCount,
      pageSize,
      goToNextPage,
      goToPreviousPage,
      hasNextPage: currentPage * pageSize < totalCount,
      hasPreviousPage: currentPage > 1
    }
  };
};
