
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

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.info("useFinanciero effect - triggering data refresh");
      
      // First, fetch data from mv_faturamento_resumido for BLUEBAY center cost
      const { data: faturamento, error: faturamentoError } = await supabase
        .from('mv_faturamento_resumido')
        .select('*')
        .eq('CENTROCUSTO', 'BLUEBAY');
        
      if (faturamentoError) {
        console.error("Error fetching invoices:", faturamentoError);
        throw faturamentoError;
      }

      // Log the sample data to check structure
      console.info("Sample data from mv_faturamento_resumido:", faturamento?.[0]);
      
      if (!faturamento || faturamento.length === 0) {
        setConsolidatedInvoices([]);
        setFinancialTitles([]);
        setAvailableStatuses(['all']);
        setIsLoading(false);
        return;
      }

      // Extract NOTAs to fetch related titles
      const notas = faturamento.map(item => String(item.NOTA));
      
      // Fetch titles linked to these invoices by NOTA
      const { data: titulos, error: titulosError } = await supabase
        .from('BLUEBAY_TITULO')
        .select('*')
        .in('NUMNOTA', notas);
      
      if (titulosError) {
        console.error("Error fetching titles:", titulosError);
        throw titulosError;
      }
      
      console.info(`Fetched ${faturamento?.length || 0} invoices and ${titulos?.length || 0} titles`);
      
      // If no titles were found directly related to invoices, fetch all titles for BLUEBAY
      if (!titulos || titulos.length === 0) {
        console.info("No titles found linked to invoices, fetching all titles for BLUEBAY");
        const { data: allTitulos, error: allTitulosError } = await supabase
          .from('BLUEBAY_TITULO')
          .select('*');
          
        if (allTitulosError) {
          console.error("Error fetching all titles:", allTitulosError);
        } else {
          console.info(`Fetched ${allTitulos?.length || 0} total titles`);
          // Use these titles instead
          const processedTitulos = allTitulos || [];
          
          // Get all unique client codes for these titles
          const clienteCodigos = [...new Set(
            processedTitulos.map(titulo => 
              typeof titulo.PES_CODIGO === 'string' ? 
                titulo.PES_CODIGO : String(titulo.PES_CODIGO)
            )
          )].filter(Boolean);
          
          // Fetch client data
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
          
          // Since we have titles but no invoices matched, create placeholder invoices
          const invoices: ConsolidatedInvoice[] = [];
          setConsolidatedInvoices(invoices);
          
          setIsLoading(false);
          return;
        }
      }
      
      // Get all unique client codes to fetch client information in one batch
      const clienteCodigos = [...new Set([
        ...faturamento.map(item => typeof item.PES_CODIGO === 'string' ? 
          item.PES_CODIGO : String(item.PES_CODIGO)),
        ...(titulos || []).map(titulo => typeof titulo.PES_CODIGO === 'string' ? 
          titulo.PES_CODIGO : String(titulo.PES_CODIGO))
      ])].filter(Boolean);
      
      // Fetch all client data in one query
      const clientesMap = await fetchClientData(clienteCodigos);
      
      // Process invoices
      const consolidatedData: ConsolidatedInvoice[] = [];
      for (const item of faturamento) {
        const invoice = createConsolidatedInvoice(item, clientesMap);
        
        // Find matching titles for this invoice to get due date
        const matchingTitles = titulos?.filter(titulo => 
          String(titulo.NUMNOTA) === String(item.NOTA)) || [];
        
        // Set due date from the title if available
        if (matchingTitles.length > 0) {
          invoice.DATA_VENCIMENTO = matchingTitles[0].DTVENCIMENTO || 
            matchingTitles[0].DTVENCTO || null;
        }
        
        consolidatedData.push(invoice);
      }
      
      // Update invoice values based on related titles
      for (const titulo of titulos || []) {
        // Find the related invoice
        const invoice = consolidatedData.find(inv => String(inv.NOTA) === String(titulo.NUMNOTA));
        if (invoice) {
          updateInvoiceWithTitles(invoice, titulo);
        }
      }
      
      setConsolidatedInvoices(consolidatedData);
      
      // Process titles with client names
      const processedTitles = (titulos || []).map(titulo => 
        processFinancialTitle(titulo, clientesMap)
      );
      
      setFinancialTitles(processedTitles);
      
      // Collect unique statuses for filter
      const uniqueStatuses = [...new Set([
        ...processedTitles.map(title => title.STATUS || "").filter(Boolean)
      ])];
      
      setAvailableStatuses(['all', ...uniqueStatuses]);
      
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  const updateDateRange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
  }, []);

  return {
    isLoading,
    consolidatedInvoices,
    financialTitles,
    availableStatuses,
    dateRange,
    updateDateRange,
    refreshData,
  };
};
