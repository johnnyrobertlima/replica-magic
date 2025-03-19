
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

  const { data: titlesData, error } = await query;

  if (error) {
    console.error("Error fetching financial titles:", error);
    throw error;
  }

  // Get all B&K pedidos to filter titles
  const { data: bkPedidos, error: bkError } = await supabase
    .from('BLUEBAY_PEDIDO')
    .select('PED_NUMPEDIDO')
    .eq('CENTROCUSTO', 'BK');

  if (bkError) {
    console.error("Error fetching BK pedidos:", bkError);
    throw bkError;
  }

  // Create a Set of PED_NUMPEDIDO values from BK pedidos for efficient lookup
  const bkPedidoSet = new Set(bkPedidos?.map(pedido => pedido.PED_NUMPEDIDO));

  // Filter titles to only include those associated with BK pedidos
  // In this case, we're assuming NUMNOTA in BLUEBAY_TITULO corresponds to PED_NUMPEDIDO in BLUEBAY_PEDIDO
  const bkTitlesData = (titlesData || []).filter(title => 
    title.NUMNOTA && bkPedidoSet.has(title.NUMNOTA.toString())
  );

  // Fetch client names for the titles
  const titles: FinancialTitle[] = await Promise.all(
    bkTitlesData.map(async (title) => {
      let clientName = "Cliente não encontrado";

      if (title.PES_CODIGO) {
        const { data: clientData, error: clientError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('APELIDO, RAZAOSOCIAL')
          .eq('PES_CODIGO', parseInt(title.PES_CODIGO as string))
          .maybeSingle();

        if (!clientError && clientData) {
          clientName = clientData.APELIDO || clientData.RAZAOSOCIAL || "Cliente não encontrado";
        }
      }

      return {
        ...title,
        CLIENTE_NOME: clientName,
        CENTROCUSTO: 'BK', // Explicitly set CENTROCUSTO for all filtered titles
      } as FinancialTitle;
    })
  );

  return titles;
};
