
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

    // First, fetch all pedidos that match our criteria
    const { data: pedidosData, error: pedidosError } = await supabase
      .from("BLUEBAY_PEDIDO")
      .select("*")
      .eq("CENTROCUSTO", "BLUEBAY")
      .gte(formattedStartDate ? "DATA_PEDIDO" : "MATRIZ", formattedStartDate ?? 0)
      .lte(formattedEndDate ? "DATA_PEDIDO" : "MATRIZ", formattedEndDate ?? 9999999);

    if (pedidosError) {
      console.error("Error fetching BLUEBAY pedidos:", pedidosError);
      throw pedidosError;
    }

    // Get unique item codes from the pedidos
    const itemCodes = [...new Set(pedidosData.map(item => item.ITEM_CODIGO).filter(Boolean))];
    
    // Fetch item details in a separate query
    const { data: itemsData, error: itemsError } = await supabase
      .from("BLUEBAY_ITEM")
      .select("ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO")
      .in("ITEM_CODIGO", itemCodes);
    
    if (itemsError) {
      console.error("Error fetching BLUEBAY items details:", itemsError);
      throw itemsError;
    }
    
    // Create a lookup map for item details
    const itemsMap = new Map();
    itemsData.forEach(item => {
      itemsMap.set(item.ITEM_CODIGO, item);
    });

    // Process the results to extract item details and calculate totals
    const processedItems = pedidosData.reduce((acc, item) => {
      const itemCode = item.ITEM_CODIGO;
      if (!itemCode) return acc;

      const itemDetails = itemsMap.get(itemCode) || {};
      const descricao = itemDetails.DESCRICAO || '';
      const grupoDescricao = itemDetails.GRU_DESCRICAO || 'Sem Grupo';
      
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
    const { data: pedidosData, error: pedidosError } = await supabase
      .from("BLUEBAY_PEDIDO")
      .select("*")
      .eq("ITEM_CODIGO", itemCode)
      .eq("CENTROCUSTO", "BLUEBAY")
      .gte(formattedStartDate ? "DATA_PEDIDO" : "MATRIZ", formattedStartDate ?? 0)
      .lte(formattedEndDate ? "DATA_PEDIDO" : "MATRIZ", formattedEndDate ?? 9999999);

    if (pedidosError) {
      console.error("Error fetching item details:", pedidosError);
      throw pedidosError;
    }

    // Get unique customer codes
    const customerCodes = [...new Set(pedidosData.map(item => item.PES_CODIGO).filter(Boolean))];
    
    // Fetch customer details in a separate query
    const { data: customersData, error: customersError } = await supabase
      .from("BLUEBAY_PESSOA")
      .select("PES_CODIGO, APELIDO")
      .in("PES_CODIGO", customerCodes);
    
    if (customersError) {
      console.error("Error fetching customer details:", customersError);
      throw customersError;
    }
    
    // Create a lookup map for customer details
    const customersMap = new Map();
    customersData.forEach(customer => {
      customersMap.set(customer.PES_CODIGO, customer);
    });

    // Format the data with client name included
    const detailedItems = pedidosData.map(item => {
      const customer = customersMap.get(item.PES_CODIGO) || {};
      
      return {
        DATA_PEDIDO: item.DATA_PEDIDO,
        PED_NUMPEDIDO: item.PED_NUMPEDIDO,
        CLIENTE_NOME: customer.APELIDO || 'Cliente não identificado',
        QUANTIDADE: item.QTDE_PEDIDA,
        VALOR_UNITARIO: item.VALOR_UNITARIO,
        TOTAL: (Number(item.QTDE_PEDIDA || 0) * Number(item.VALOR_UNITARIO || 0))
      };
    });

    return detailedItems;
  } catch (error) {
    console.error("Error fetching item details:", error);
    throw error;
  }
};
