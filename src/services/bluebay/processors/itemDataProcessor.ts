
import { supabase } from "@/integrations/supabase/client";

/**
 * Processes raw faturamento data to extract and enrich item information
 */
export const processFaturamentoData = async (faturamentoData: any[]) => {
  try {
    // Verificar se os dados são um array antes de processar
    if (!Array.isArray(faturamentoData)) {
      console.error("Dados de faturamento não são um array:", faturamentoData);
      return [];
    }
    
    // Extrair códigos de itens únicos
    const itemCodes = [...new Set(faturamentoData.map(item => item.ITEM_CODIGO).filter(Boolean))];
    console.log("Códigos de itens únicos encontrados:", itemCodes.length);
    
    if (itemCodes.length === 0) {
      console.log("Nenhum código de item encontrado para processar");
      return [];
    }
    
    // Buscar detalhes dos itens
    const { data: itemsData, error: itemsError } = await supabase
      .from("BLUEBAY_ITEM")
      .select("ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO")
      .in("ITEM_CODIGO", itemCodes);
    
    if (itemsError) {
      console.error("Erro ao buscar detalhes dos itens:", itemsError);
      throw itemsError;
    }
    
    console.log("Detalhes de itens encontrados:", itemsData?.length || 0);
    
    // Criar mapa de itens para lookup rápido
    const itemsMap = new Map();
    itemsData?.forEach(item => {
      itemsMap.set(item.ITEM_CODIGO, item);
    });

    // Extrair códigos de clientes únicos
    const clienteCodes = [...new Set(faturamentoData.map(item => item.PES_CODIGO).filter(Boolean))];
    console.log("Códigos de clientes únicos encontrados:", clienteCodes.length);
    
    if (clienteCodes.length === 0) {
      console.log("Nenhum código de cliente encontrado para processar");
    }
    
    // Buscar informações dos clientes
    const { data: clientesData, error: clientesError } = await supabase
      .from("BLUEBAY_PESSOA")
      .select("PES_CODIGO, APELIDO")
      .in("PES_CODIGO", clienteCodes as number[]);
    
    if (clientesError) {
      console.error("Erro ao buscar informações dos clientes:", clientesError);
      throw clientesError;
    }
    
    console.log("Informações de clientes encontradas:", clientesData?.length || 0);
    
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
    
    console.log("Itens processados com sucesso:", processedItems.length);

    return processedItems;
  } catch (error) {
    console.error("Erro ao processar dados de faturamento:", error);
    throw error;
  }
};
