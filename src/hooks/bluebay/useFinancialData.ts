
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
      // First, let's check the structure of mv_faturamento_resumido
      const { data: columns, error: columnsError } = await supabase
        .from('mv_faturamento_resumido')
        .select()
        .eq('CENTROCUSTO', 'BLUEBAY')
        .limit(1);
      
      if (columnsError) {
        console.error("Error checking columns:", columnsError);
        throw columnsError;
      }

      // Log the columns so we can see what we're working with
      console.log("Sample data from mv_faturamento_resumido:", columns);
      
      // Now proceed with the actual query using the correct column names
      const { data: faturamento, error: faturamentoError } = await supabase
        .from('mv_faturamento_resumido')
        .select('*')
        .eq('CENTROCUSTO', 'BLUEBAY');
        
      if (faturamentoError) {
        console.error("Error fetching invoices:", faturamentoError);
        throw faturamentoError;
      }

      // If we got data, log it to see what we're working with
      if (faturamento && faturamento.length > 0) {
        console.log("First invoice sample:", faturamento[0]);
      }

      // Collect all unique NOTAs from invoices to fetch related titles
      const notas = faturamento?.map(item => item.NOTA || item.nota) || [];
      
      // Fetch titles linked to these invoices by NOTA
      const { data: titulos, error: titulosError } = await supabase
        .from('BLUEBAY_TITULO')
        .select('*')
        .in('NUMNOTA', notas);
      
      if (titulosError) {
        console.error("Error fetching titles:", titulosError);
        throw titulosError;
      }
      
      console.log(`Fetched ${faturamento?.length || 0} invoices and ${titulos?.length || 0} titles`);
      
      // Log a sample title to see its structure
      if (titulos && titulos.length > 0) {
        console.log("First title sample:", titulos[0]);
      }

      // Consolidate invoices by NOTA
      const invoiceMap = new Map<string, ConsolidatedInvoice>();
      
      for (const item of faturamento || []) {
        // Determine the correct property names
        const nota = item.NOTA || item.nota;
        const dataEmissao = item.DATA_EMISSAO || item.data_emissao;
        const status = item.STATUS || item.status;
        const valorNota = item.VALOR_NOTA || item.valor_nota || 0;
        const pesCode = item.PES_CODIGO || item.pes_codigo;
        
        // Fetch client name
        const { data: clientData } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('APELIDO, RAZAOSOCIAL')
          .eq('PES_CODIGO', pesCode)
          .maybeSingle();
        
        const clientName = clientData?.APELIDO || clientData?.RAZAOSOCIAL || "Cliente não encontrado";
        
        if (!invoiceMap.has(nota)) {
          invoiceMap.set(nota, {
            NOTA: nota,
            DATA_EMISSAO: dataEmissao,
            STATUS: status,
            VALOR_NOTA: valorNota,
            VALOR_PAGO: 0,
            VALOR_SALDO: valorNota,
            PES_CODIGO: pesCode,
            CLIENTE_NOME: clientName
          });
        } else {
          const existingInvoice = invoiceMap.get(nota)!;
          existingInvoice.VALOR_NOTA += valorNota;
          existingInvoice.VALOR_SALDO += valorNota;
        }
      }
      
      // Update invoice values based on related titles
      for (const titulo of titulos || []) {
        // Check if this title is related to any invoice
        const invoiceNota = String(titulo.NUMNOTA);
        const invoice = invoiceMap.get(invoiceNota);
        if (invoice) {
          // Calculate paid amount based on title values
          const paidAmount = (titulo.VLRTITULO || 0) - (titulo.VLRSALDO || 0);
          invoice.VALOR_PAGO += paidAmount;
          invoice.VALOR_SALDO = invoice.VALOR_NOTA - invoice.VALOR_PAGO;
        }
      }
      
      setConsolidatedInvoices(Array.from(invoiceMap.values()));
      
      // Process titles with client names
      const processedTitles: FinancialTitle[] = await Promise.all(
        (titulos || []).map(async (titulo: any) => {
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
      
      // Extract unique statuses for filter
      const invoiceStatuses = [...new Set(faturamento?.map(invoice => {
        const status = invoice.STATUS || invoice.status;
        return status || "";
      }) || [])];
      
      const titleStatuses = [...new Set(processedTitles.map(title => title.STATUS || ""))];
      const uniqueStatuses = [...new Set([...invoiceStatuses, ...titleStatuses])];
      
      setAvailableStatuses(['all', ...uniqueStatuses.filter(status => status !== "")]);
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
