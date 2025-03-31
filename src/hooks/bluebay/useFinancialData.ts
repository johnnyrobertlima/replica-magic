
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { DateRange } from "@/hooks/bk/financial/types";

export interface FinancialTitle {
  NUMNOTA: string | number;
  DTEMISSAO: string;
  DTVENCIMENTO: string;
  DTPAGTO: string | null;
  VLRDESCONTO: number;
  VLRTITULO: number;
  VLRSALDO: number;
  STATUS: string;
  PES_CODIGO: string | number;
  CLIENTE_NOME: string;
}

export interface ConsolidatedInvoice {
  NOTA: string;
  DATA_EMISSAO: string;
  STATUS: string;
  VALOR_NOTA: number;
  VALOR_PAGO: number;
  VALOR_SALDO: number;
  PES_CODIGO: number;
  CLIENTE_NOME: string;
}

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
      const notas = faturamento.map(item => item.NOTA);
      
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
      
      // Consolidate invoices data
      const consolidatedData: ConsolidatedInvoice[] = [];
      
      for (const item of faturamento) {
        // Get client name
        const { data: clientData } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('APELIDO, RAZAOSOCIAL')
          .eq('PES_CODIGO', item.PES_CODIGO)
          .maybeSingle();
        
        const clientName = clientData?.APELIDO || clientData?.RAZAOSOCIAL || "Cliente não encontrado";
        
        // Create consolidated invoice object
        // Note: We need to determine what status to use for invoices
        const invoiceStatus = "1"; // Default to "Em Aberto"
        
        // Check if the VALOR property exists, if not use a default of 0
        const invoiceValue = typeof item.VALOR !== 'undefined' ? 
          parseFloat(String(item.VALOR)) : 
          0;
        
        // Get data_emissao if it exists
        const dataEmissao = item.DATA_EMISSAO || "";
        
        consolidatedData.push({
          NOTA: item.NOTA,
          DATA_EMISSAO: dataEmissao,
          STATUS: invoiceStatus,
          VALOR_NOTA: invoiceValue,
          VALOR_PAGO: 0, // We'll calculate this from titles
          VALOR_SALDO: invoiceValue,
          PES_CODIGO: typeof item.PES_CODIGO === 'string' ? 
            parseInt(item.PES_CODIGO, 10) : 
            item.PES_CODIGO,
          CLIENTE_NOME: clientName
        });
      }
      
      // Update invoice values based on related titles
      for (const titulo of titulos || []) {
        // Find the related invoice
        const invoice = consolidatedData.find(inv => String(inv.NOTA) === String(titulo.NUMNOTA));
        if (invoice) {
          // Calculate paid amount based on title values
          const paidAmount = (titulo.VLRTITULO || 0) - (titulo.VLRSALDO || 0);
          invoice.VALOR_PAGO += paidAmount;
          invoice.VALOR_SALDO = invoice.VALOR_NOTA - invoice.VALOR_PAGO;
        }
      }
      
      setConsolidatedInvoices(consolidatedData);
      
      // Process titles with client names
      const processedTitles: FinancialTitle[] = await Promise.all(
        (titulos || []).map(async (titulo) => {
          let clientName = "Cliente não encontrado";

          if (titulo.PES_CODIGO) {
            const { data: clientData } = await supabase
              .from('BLUEBAY_PESSOA')
              .select('APELIDO, RAZAOSOCIAL')
              .eq('PES_CODIGO', titulo.PES_CODIGO)
              .maybeSingle();

            clientName = clientData?.APELIDO || clientData?.RAZAOSOCIAL || "Cliente não encontrado";
          }

          return {
            NUMNOTA: titulo.NUMNOTA,
            DTEMISSAO: titulo.DTEMISSAO,
            DTVENCIMENTO: titulo.DTVENCIMENTO || titulo.DTVENCTO,
            DTPAGTO: titulo.DTPAGTO,
            VLRDESCONTO: titulo.VLRDESCONTO || 0,
            VLRTITULO: titulo.VLRTITULO || 0,
            VLRSALDO: titulo.VLRSALDO || 0,
            STATUS: titulo.STATUS,
            PES_CODIGO: titulo.PES_CODIGO,
            CLIENTE_NOME: clientName,
          } as FinancialTitle;
        })
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
