
import { supabase } from "@/integrations/supabase/client";
import { FinancialTitle } from "./types/financialTypes";

export const fetchFinancialTitles = async (startDate?: string, endDate?: string, status?: string): Promise<FinancialTitle[]> => {
  let query = supabase
    .from('mv_titulos_centro_custo_bk')
    .select(`
      NUMNOTA,
      DTEMISSAO,
      DTVENCIMENTO,
      DTPAGTO,
      VLRDESCONTO,
      VLRTITULO,
      VLRSALDO,
      STATUS,
      PES_CODIGO
    `);

  // Apply date filters to DTVENCIMENTO instead of DTEMISSAO
  if (startDate) {
    query = query.gte('DTVENCIMENTO', startDate);
  }
  
  if (endDate) {
    query = query.lte('DTVENCIMENTO', endDate);
  }

  // Apply status filter if provided
  if (status && status !== 'all') {
    query = query.eq('STATUS', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching financial titles:", error);
    throw error;
  }

  // Fetch client names for the titles
  const titles: FinancialTitle[] = await Promise.all(
    (data || []).map(async (title: any) => {
      let clientName = "Cliente não encontrado";

      if (title.PES_CODIGO) {
        const { data: clientData } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('APELIDO, RAZAOSOCIAL')
          .eq('PES_CODIGO', parseInt(title.PES_CODIGO as string))
          .maybeSingle();

        clientName = clientData?.APELIDO || clientData?.RAZAOSOCIAL || "Cliente não encontrado";
      }

      return {
        NUMNOTA: title.NUMNOTA,
        DTEMISSAO: title.DTEMISSAO,
        DTVENCIMENTO: title.DTVENCIMENTO,
        DTPAGTO: title.DTPAGTO,
        VLRDESCONTO: title.VLRDESCONTO,
        VLRTITULO: title.VLRTITULO,
        VLRSALDO: title.VLRSALDO,
        STATUS: title.STATUS,
        PES_CODIGO: title.PES_CODIGO,
        CLIENTE_NOME: clientName,
        CENTROCUSTO: 'BK' // Explicitly set CENTROCUSTO since we're querying from mv_titulos_centro_custo_bk
      } as FinancialTitle;
    })
  );

  return titles;
};
