
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
      
      // Primeiro, buscar todos os títulos do BLUEBAY diretamente
      const { data: allTitulos, error: allTitulosError } = await supabase
        .from('BLUEBAY_TITULO')
        .select('*');
      
      if (allTitulosError) {
        console.error("Error fetching all titles:", allTitulosError);
        throw allTitulosError;
      }
      
      console.info(`Fetched ${allTitulos?.length || 0} total titles for BLUEBAY`);
      
      // Processar títulos
      const processedTitulos = allTitulos || [];
      
      // Coletar todos os códigos de cliente únicos para esses títulos
      const clienteCodigos = [...new Set(
        processedTitulos.map(titulo => 
          typeof titulo.PES_CODIGO === 'string' ? 
            titulo.PES_CODIGO : String(titulo.PES_CODIGO)
        )
      )].filter(Boolean) as Array<string | number>;
      
      console.info(`Found ${clienteCodigos.length} unique client codes in titles`);
      
      // Buscar dados dos clientes
      const clientesMap = await fetchClientData(clienteCodigos);
      
      // Processar títulos com nomes de clientes
      const processedTitles = processedTitulos.map(titulo => 
        processFinancialTitle(titulo, clientesMap)
      );
      
      setFinancialTitles(processedTitles);
      
      // Coletar status únicos para filtro
      const uniqueStatuses = [...new Set([
        ...processedTitles.map(title => title.STATUS || "").filter(Boolean)
      ])];
      
      setAvailableStatuses(['all', ...uniqueStatuses]);
      
      // Buscar dados de faturamento para BLUEBAY centro de custo
      const { data: faturamento, error: faturamentoError } = await supabase
        .from('mv_faturamento_resumido')
        .select('*')
        .eq('CENTROCUSTO', 'BLUEBAY');
      
      if (faturamentoError) {
        console.error("Error fetching invoices:", faturamentoError);
      } else {
        console.info(`Fetched ${faturamento?.length || 0} invoices for BLUEBAY`);
        
        // Processar faturas
        const consolidatedData: ConsolidatedInvoice[] = [];
        
        if (faturamento && faturamento.length > 0) {
          for (const item of faturamento) {
            const invoice = createConsolidatedInvoice(item, clientesMap);
            
            // Encontrar títulos correspondentes para esta fatura
            const matchingTitles = processedTitulos.filter(titulo => 
              String(titulo.NUMNOTA) === String(item.NOTA)) || [];
            
            // Definir data de vencimento do título se disponível
            if (matchingTitles.length > 0) {
              invoice.DATA_VENCIMENTO = matchingTitles[0].DTVENCIMENTO || 
                matchingTitles[0].DTVENCTO || null;
            }
            
            consolidatedData.push(invoice);
          }
          
          // Atualizar valores de fatura com base em títulos relacionados
          for (const titulo of processedTitulos) {
            // Encontrar a fatura relacionada
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
