
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
      // Format dates for API request
      const startDateFormatted = dateRange.startDate 
        ? format(dateRange.startDate, 'yyyy-MM-dd') 
        : undefined;
      
      const endDateFormatted = dateRange.endDate
        ? format(dateRange.endDate, 'yyyy-MM-dd')
        : undefined;

      // Fetch financial titles with CENTROCUSTO = 'BLUEBAY'
      const { data: titulos, error: titulosError } = await supabase
        .from('BLUEBAY_TITULO')
        .select('*')
        .eq('STATUS', '1');
      
      if (titulosError) throw titulosError;

      // Fetch client names for the titles
      const titles: FinancialTitle[] = await Promise.all(
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
            DTVENCIMENTO: titulo.DTVENCIMENTO,
            DTPAGTO: titulo.DTPAGTO,
            VLRDESCONTO: titulo.VLRDESCONTO,
            VLRTITULO: titulo.VLRTITULO,
            VLRSALDO: titulo.VLRSALDO,
            STATUS: titulo.STATUS,
            PES_CODIGO: titulo.PES_CODIGO,
            CLIENTE_NOME: clientName,
          } as FinancialTitle;
        })
      );
      
      setFinancialTitles(titles);

      // Fetch faturamento data with CENTROCUSTO = 'BLUEBAY'
      const { data: faturamento, error: faturamentoError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select(`
          NOTA,
          DATA_EMISSAO,
          STATUS,
          VALOR_NOTA,
          PES_CODIGO
        `)
        .eq('STATUS', '1');
        
      if (faturamentoError) throw faturamentoError;

      // Consolidate invoices by NOTA
      const invoiceMap = new Map<string, ConsolidatedInvoice>();
      
      for (const item of faturamento || []) {
        // Fetch client name
        const { data: clientData } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('APELIDO, RAZAOSOCIAL')
          .eq('PES_CODIGO', item.PES_CODIGO)
          .maybeSingle();
        
        const clientName = clientData?.APELIDO || clientData?.RAZAOSOCIAL || "Cliente não encontrado";
        
        if (!invoiceMap.has(item.NOTA)) {
          invoiceMap.set(item.NOTA, {
            NOTA: item.NOTA,
            DATA_EMISSAO: item.DATA_EMISSAO,
            STATUS: item.STATUS,
            VALOR_NOTA: item.VALOR_NOTA || 0,
            VALOR_PAGO: 0,
            VALOR_SALDO: item.VALOR_NOTA || 0,
            PES_CODIGO: item.PES_CODIGO,
            CLIENTE_NOME: clientName
          });
        } else {
          const existingInvoice = invoiceMap.get(item.NOTA)!;
          existingInvoice.VALOR_NOTA += (item.VALOR_NOTA || 0);
          existingInvoice.VALOR_SALDO += (item.VALOR_NOTA || 0);
        }
      }
      
      setConsolidatedInvoices(Array.from(invoiceMap.values()));
      
      // Extract unique statuses for filter
      const invoiceStatuses = [...new Set((faturamento || []).map(invoice => invoice.STATUS || ""))];
      const titleStatuses = [...new Set(titles.map(title => title.STATUS || ""))];
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
