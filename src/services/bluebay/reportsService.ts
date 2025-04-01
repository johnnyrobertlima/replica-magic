
import { supabase } from "@/integrations/supabase/client";
import { formatISO } from "date-fns";

const fetchBluebayFaturamentoData = async (startDate?: string, endDate?: string) => {
  try {
    console.info("Buscando dados de faturamento com função RPC:", { startDate, endDate });
    
    // Usando a função RPC para buscar os dados de faturamento
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_bluebay_faturamento', {
      start_date: startDate,
      end_date: endDate
    });

    if (rpcError) {
      console.error("Erro ao buscar dados de faturamento:", rpcError);
      throw rpcError;
    }

    console.log("Dados retornados da função RPC:", rpcData);
    return rpcData || [];
  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
    throw error;
  }
};

const processFaturamentoData = async (faturamentoData: any[]) => {
  try {
    // Verificar se os dados são um array antes de processar
    if (!Array.isArray(faturamentoData)) {
      console.error("Dados de faturamento não são um array:", faturamentoData);
      return [];
    }
    
    // Extrair códigos de itens únicos
    const itemCodes = [...new Set(faturamentoData.map(item => item.ITEM_CODIGO).filter(Boolean))];
    
    // Buscar detalhes dos itens
    const { data: itemsData, error: itemsError } = await supabase
      .from("BLUEBAY_ITEM")
      .select("ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO")
      .in("ITEM_CODIGO", itemCodes);
    
    if (itemsError) {
      console.error("Erro ao buscar detalhes dos itens:", itemsError);
      throw itemsError;
    }
    
    // Criar mapa de itens para lookup rápido
    const itemsMap = new Map();
    itemsData?.forEach(item => {
      itemsMap.set(item.ITEM_CODIGO, item);
    });

    // Extrair códigos de clientes únicos
    const clienteCodes = [...new Set(faturamentoData.map(item => item.PES_CODIGO).filter(Boolean))];
    
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

    // Processar os itens para agrupar e calcular totais
    const processedItems = faturamentoData.reduce((acc, item) => {
      const itemCode = item.ITEM_CODIGO;
      if (!itemCode) return acc;

      const itemDetails = itemsMap.get(itemCode) || {};
      const descricao = itemDetails.DESCRICAO || '';
      const grupoDescricao = itemDetails.GRU_DESCRICAO || 'Sem Grupo';
      
      // Encontrar se o item já existe nos resultados acumulados
      const existingItemIndex = acc.findIndex(i => 
        i.ITEM_CODIGO === itemCode && i.GRU_DESCRICAO === grupoDescricao
      );

      if (existingItemIndex >= 0) {
        // Atualizar item existente
        acc[existingItemIndex].TOTAL_QUANTIDADE += Number(item.QUANTIDADE || 0);
        acc[existingItemIndex].TOTAL_VALOR += 
          Number(item.QUANTIDADE || 0) * Number(item.VALOR_UNITARIO || 0);
        acc[existingItemIndex].OCORRENCIAS += 1;
      } else {
        // Adicionar novo item
        acc.push({
          ITEM_CODIGO: itemCode,
          DESCRICAO: descricao,
          GRU_DESCRICAO: grupoDescricao,
          TOTAL_QUANTIDADE: Number(item.QUANTIDADE || 0),
          TOTAL_VALOR: Number(item.QUANTIDADE || 0) * Number(item.VALOR_UNITARIO || 0),
          OCORRENCIAS: 1
        });
      }

      return acc;
    }, []);

    // Ordenar por TOTAL_VALOR decrescente
    processedItems.sort((a, b) => b.TOTAL_VALOR - a.TOTAL_VALOR);

    return processedItems;
  } catch (error) {
    console.error("Erro ao processar dados de faturamento:", error);
    throw error;
  }
};

export const getBluebayReportItems = async (startDate?: string, endDate?: string) => {
  try {
    const formattedStartDate = startDate ? `${startDate}T00:00:00Z` : undefined;
    const formattedEndDate = endDate ? `${endDate}T23:59:59Z` : undefined;

    console.info("Buscando relatório de itens Bluebay...", {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });

    // Buscar dados de faturamento usando a função
    const faturamentoData = await fetchBluebayFaturamentoData(formattedStartDate, formattedEndDate);
    
    // Verificar se os dados são um array antes de processar
    if (!Array.isArray(faturamentoData)) {
      console.error("Dados de faturamento não são um array:", faturamentoData);
      return [];
    }
    
    // Processar os dados para obter itens agrupados com totais
    const processedItems = await processFaturamentoData(faturamentoData);
    console.log("Itens processados:", processedItems);

    return processedItems;
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    throw error;
  }
};

// Esta função busca os detalhes de um item específico
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
