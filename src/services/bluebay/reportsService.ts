
import { supabase } from "@/integrations/supabase/client";
import { formatISO } from "date-fns";

export const getBluebayReportItems = async (startDate?: string, endDate?: string) => {
  try {
    const formattedStartDate = startDate ? `${startDate}T00:00:00Z` : undefined;
    const formattedEndDate = endDate ? `${endDate}T23:59:59Z` : undefined;

    console.info("Fetching Bluebay items report data...", {
      startDate,
      endDate
    });

    // Fetch items data from BLUEBAY_PEDIDO that match CENTROCUSTO = 'BLUEBAY'
    const { data, error } = await supabase
      .from("BLUEBAY_PEDIDO")
      .select(`
        *,
        BLUEBAY_ITEM:ITEM_CODIGO(DESCRICAO, GRU_DESCRICAO)
      `)
      .eq("CENTROCUSTO", "BLUEBAY")
      .gte(formattedStartDate ? "DATA_PEDIDO" : "MATRIZ", formattedStartDate ?? 0)
      .lte(formattedEndDate ? "DATA_PEDIDO" : "MATRIZ", formattedEndDate ?? 9999999);

    if (error) {
      console.error("Error fetching BLUEBAY items:", error);
      throw error;
    }

    // Process the results to extract item details and calculate totals
    const processedItems = data.reduce((acc, item) => {
      const itemCode = item.ITEM_CODIGO;
      if (!itemCode) return acc;

      const descricao = item.BLUEBAY_ITEM?.DESCRICAO || '';
      const grupoDescricao = item.BLUEBAY_ITEM?.GRU_DESCRICAO || 'Sem Grupo';
      
      // Find if the item already exists in our accumulated results
      const existingItemIndex = acc.findIndex(i => 
        i.ITEM_CODIGO === itemCode && i.GRU_DESCRICAO === grupoDescricao
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        acc[existingItemIndex].TOTAL_QUANTIDADE += Number(item.QTDE_PEDIDA || 0);
        acc[existingItemIndex].TOTAL_VALOR += 
          Number(item.QTDE_PEDIDA || 0) * Number(item.VALOR_UNITARIO || 0);
        acc[existingItemIndex].OCORRENCIAS += 1;
      } else {
        // Add new item
        acc.push({
          ITEM_CODIGO: itemCode,
          DESCRICAO: descricao,
          GRU_DESCRICAO: grupoDescricao,
          TOTAL_QUANTIDADE: Number(item.QTDE_PEDIDA || 0),
          TOTAL_VALOR: Number(item.QTDE_PEDIDA || 0) * Number(item.VALOR_UNITARIO || 0),
          OCORRENCIAS: 1
        });
      }

      return acc;
    }, []);

    // Sort by TOTAL_VALOR descending
    processedItems.sort((a, b) => b.TOTAL_VALOR - a.TOTAL_VALOR);

    return processedItems;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

// This function fetches the item details for a specific item code
export const getBluebayItemDetails = async (itemCode: string, startDate?: string, endDate?: string) => {
  try {
    const formattedStartDate = startDate ? `${startDate}T00:00:00Z` : undefined;
    const formattedEndDate = endDate ? `${endDate}T23:59:59Z` : undefined;

    // Fetch the detailed breakdown of orders for this item
    const { data, error } = await supabase
      .from("BLUEBAY_PEDIDO")
      .select(`
        *,
        BLUEBAY_PESSOA:PES_CODIGO(APELIDO)
      `)
      .eq("ITEM_CODIGO", itemCode)
      .eq("CENTROCUSTO", "BLUEBAY")
      .gte(formattedStartDate ? "DATA_PEDIDO" : "MATRIZ", formattedStartDate ?? 0)
      .lte(formattedEndDate ? "DATA_PEDIDO" : "MATRIZ", formattedEndDate ?? 9999999);

    if (error) {
      console.error("Error fetching item details:", error);
      throw error;
    }

    // Format the data with client name included
    const detailedItems = data.map(item => ({
      DATA_PEDIDO: item.DATA_PEDIDO,
      PED_NUMPEDIDO: item.PED_NUMPEDIDO,
      CLIENTE_NOME: item.BLUEBAY_PESSOA?.APELIDO || 'Cliente não identificado',
      QUANTIDADE: item.QTDE_PEDIDA,
      VALOR_UNITARIO: item.VALOR_UNITARIO,
      TOTAL: (Number(item.QTDE_PEDIDA || 0) * Number(item.VALOR_UNITARIO || 0))
    }));

    return detailedItems;
  } catch (error) {
    console.error("Error fetching item details:", error);
    throw error;
  }
};
