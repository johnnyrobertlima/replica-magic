
import { supabase } from "@/integrations/supabase/client";
import { FinancialTitle } from "./types/financialTypes";

export const fetchFinancialTitles = async (startDate?: string, endDate?: string, status?: string): Promise<FinancialTitle[]> => {
  let query = supabase
    .from('BLUEBAY_TITULO')
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

  // Apply date filters if provided
  if (startDate) {
    query = query.gte('DTEMISSAO', startDate);
  }
  
  if (endDate) {
    query = query.lte('DTEMISSAO', endDate);
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
    (data || []).map(async (title) => {
      let clientName = "Cliente não encontrado";

      if (title.PES_CODIGO) {
        const { data: clientData } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('APELIDO, RAZAOSOCIAL')
          .eq('PES_CODIGO', title.PES_CODIGO)
          .single();

        clientName = clientData?.APELIDO || clientData?.RAZAOSOCIAL || "Cliente não encontrado";
      }

      return {
        ...title,
        CLIENTE_NOME: clientName,
      } as FinancialTitle;
    })
  );

  return titles;
};
