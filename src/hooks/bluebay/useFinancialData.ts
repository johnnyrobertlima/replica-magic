
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
      console.info("Iniciando refreshData - buscando dados financeiros");
      
      // Format dates for database filtering
      const startDateFormatted = dateRange.startDate 
        ? format(dateRange.startDate, 'yyyy-MM-dd') 
        : null;
      
      const endDateFormatted = dateRange.endDate
        ? format(dateRange.endDate, 'yyyy-MM-dd')
        : null;

      console.log(`Filtrando por período: ${startDateFormatted} até ${endDateFormatted}`);
      
      // 1. Prepare the query for BLUEBAY_TITULO with proper date filtering
      let tituloQuery = supabase
        .from('BLUEBAY_TITULO')
        .select('*', { count: 'exact' });
      
      // Apply date filters if both dates are provided
      if (startDateFormatted && endDateFormatted) {
        // Usando o operador IS NULL para incluir registros com valor nulo
        const titulosComDataNula = await supabase
          .from('BLUEBAY_TITULO')
          .select('*')
          .is('DTVENCIMENTO', null);
            
        // Agora pegamos os registros com data dentro do intervalo
        tituloQuery = tituloQuery
          .gte('DTVENCIMENTO', startDateFormatted)
          .lte('DTVENCIMENTO', endDateFormatted);
      }
      
      // 2. Add pagination with proper range calculation
      tituloQuery = tituloQuery
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      
      // Execute query
      const { data: allTitulos, error: allTitulosError, count } = await tituloQuery;
      
      if (allTitulosError) {
        console.error("Erro ao buscar títulos:", allTitulosError);
        throw allTitulosError;
      }
      
      // Update total count for pagination if available
      if (count !== null) {
        setTotalCount(count);
      }
      
      console.info(`Buscados ${allTitulos?.length || 0} títulos (página ${currentPage}, de ${(currentPage - 1) * pageSize + 1} até ${Math.min(currentPage * pageSize, totalCount || 0)})`);
      console.info(`Total de registros: ${count}`);
      
      // Process titles
      const processedTitulos = allTitulos || [];
      
      // 3. Collect all unique client codes for these titles
      const clienteCodigos = [...new Set(
        processedTitulos.map(titulo => 
          typeof titulo.PES_CODIGO === 'string' ? 
            titulo.PES_CODIGO : String(titulo.PES_CODIGO)
        )
      )].filter(Boolean) as Array<string | number>;
      
      console.info(`Encontrados ${clienteCodigos.length} códigos de clientes únicos`);
      
      // Fetch client data - now returns Record<string | number, ClientInfo> instead of Map
      const clientesMap = await fetchClientData(clienteCodigos);
      
      if (!clientesMap) {
        console.warn("Não foi possível buscar dados dos clientes - usando nomes vazios");
      }
      
      // Process titles with client names
      const processedTitles = processedTitulos.map(titulo => 
        processFinancialTitle(titulo, clientesMap || {})
      );
      
      setFinancialTitles(processedTitles);
      
      // Collect unique statuses for filter
      const uniqueStatuses = [...new Set([
        ...processedTitles.map(title => title.STATUS || "").filter(Boolean)
      ])];
      
      setAvailableStatuses(['all', ...uniqueStatuses]);
      
      // 4. Fetch billing data for BLUEBAY cost center
      let faturamentoQuery = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*');
      
      // Apply date filters to faturamento if needed
      if (startDateFormatted && endDateFormatted) {
        faturamentoQuery = faturamentoQuery
          .gte('DATA_EMISSAO', startDateFormatted)
          .lte('DATA_EMISSAO', endDateFormatted);
      }
      
      const { data: faturamento, error: faturamentoError } = await faturamentoQuery;
      
      if (faturamentoError) {
        console.error("Erro ao buscar faturamento:", faturamentoError);
      } else {
        console.info(`Buscados ${faturamento?.length || 0} registros de faturamento`);
        
        // Process invoices
        const consolidatedData: ConsolidatedInvoice[] = [];
        
        if (faturamento && faturamento.length > 0) {
          for (const item of faturamento) {
            try {
              const invoice = createConsolidatedInvoice(item, clientesMap || {});
              
              // Find corresponding titles for this invoice
              const matchingTitles = processedTitulos.filter(titulo => 
                String(titulo.NUMNOTA) === String(item.NOTA)) || [];
              
              // Set due date of the title if available
              if (matchingTitles.length > 0) {
                invoice.DATA_VENCIMENTO = matchingTitles[0].DTVENCIMENTO || 
                  matchingTitles[0].DTVENCTO || null;
              }
              
              consolidatedData.push(invoice);
            } catch (err) {
              console.error(`Erro ao processar faturamento ${item.NOTA}:`, err);
            }
          }
          
          // Update invoice values based on related titles
          for (const titulo of processedTitulos) {
            try {
              // Find the related invoice
              const invoice = consolidatedData.find(inv => 
                String(inv.NOTA) === String(titulo.NUMNOTA));
              
              if (invoice) {
                updateInvoiceWithTitles(invoice, titulo);
              }
            } catch (err) {
              console.error(`Erro ao atualizar faturamento com título ${titulo.NUMNOTA}:`, err);
            }
          }
        }
        
        setConsolidatedInvoices(consolidatedData);
      }
      
    } catch (error) {
      console.error("Erro geral ao buscar dados financeiros:", error);
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
