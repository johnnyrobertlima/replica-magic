
import { supabase } from "@/integrations/supabase/client";
import { fetchBluebayFaturamentoData } from "../api/faturamentoService";

/**
 * Fetches detailed information about a specific item
 */
export const getBluebayItemDetails = async (itemCode: string, startDate?: string, endDate?: string) => {
  try {
    const formattedStartDate = startDate ? `${startDate}T00:00:00Z` : undefined;
    const formattedEndDate = endDate ? `${endDate}T23:59:59Z` : undefined;

    // Buscar dados de faturamento
    const faturamentoData = await fetchBluebayFaturamentoData(formattedStartDate, formattedEndDate);
    
    // Verificar se os dados são um array antes de processar
    if (!Array.isArray(faturamentoData)) {
      console.error("Dados de faturamento não são um array:", faturamentoData);
      return [];
    }
    
    // Filtrar apenas os dados para o código de item específico
    const filteredData = faturamentoData.filter(item => 
      item.ITEM_CODIGO === itemCode && item.NOTA
    );

    console.log(`Dados filtrados para o item ${itemCode}:`, filteredData.length);
    
    if (filteredData.length === 0) {
      console.log(`Nenhum detalhe encontrado para o item ${itemCode}`);
      return [];
    }

    // Extrair códigos de clientes únicos
    const clienteCodes = [...new Set(filteredData.map(item => item.PES_CODIGO).filter(Boolean))];
    
    // Buscar informações dos clientes
    const { data: clientesData, error: clientesError } = await supabase
      .from("BLUEBAY_PESSOA")
      .select("PES_CODIGO, APELIDO")
      .in("PES_CODIGO", clienteCodes as number[]);
    
    if (clientesError) {
      console.error("Erro ao buscar informações dos clientes:", clientesError);
      throw clientesError;
    }
    
    // Criar mapa de clientes para lookup rápido
    const clientesMap = new Map();
    clientesData?.forEach(cliente => {
      clientesMap.set(cliente.PES_CODIGO, cliente);
    });

    // Formatar os dados com o nome do cliente incluído
    const detailedItems = filteredData.map(item => {
      const cliente = clientesMap.get(item.PES_CODIGO) || {};
      
      return {
        DATA_PEDIDO: item.DATA_EMISSAO,
        PED_NUMPEDIDO: item.PED_NUMPEDIDO,
        CLIENTE_NOME: cliente.APELIDO || 'Cliente não identificado',
        QUANTIDADE: item.QUANTIDADE,
        VALOR_UNITARIO: item.VALOR_UNITARIO,
        TOTAL: (Number(item.QUANTIDADE || 0) * Number(item.VALOR_UNITARIO || 0))
      };
    });

    console.log("Detalhes do item:", detailedItems);
    return detailedItems;
  } catch (error) {
    console.error("Erro ao buscar detalhes do item:", error);
    throw error;
  }
};
