
import { supabase } from "@/integrations/supabase/client";

/**
 * Processa dados de faturamento e agrupa por item
 */
export async function processItemsData(faturamentoData: any[], centrocusto: string = "BLUEBAY") {
  try {
    // Verificar se há dados para processar
    if (!faturamentoData || faturamentoData.length === 0) {
      console.log("Consultando amostra da tabela BLUEBAY_PEDIDO...");
      
      // Verificar centrocustos disponíveis
      const { data: centrocustoData } = await supabase
        .from("BLUEBAY_PEDIDO")
        .select("CENTROCUSTO")
        .eq("CENTROCUSTO", centrocusto)
        .limit(10);
      
      const uniqueCentrocustos = [...new Set(centrocustoData?.map(item => item.CENTROCUSTO))];
      console.log(`Valores únicos de CENTROCUSTO encontrados:`, uniqueCentrocustos);
      
      return []; // Retorna array vazio se não houver dados
    }

    // Extrair códigos de itens únicos do faturamento
    const itemCodes = [...new Set(faturamentoData.map(item => item.ITEM_CODIGO))];
    console.log(`Códigos de itens únicos encontrados: ${itemCodes.length}`);
    
    if (itemCodes.length === 0) {
      console.log("Nenhum código de item encontrado para processar");
      return [];
    }

    // Buscar informações dos itens
    const { data: itemsData, error: itemsError } = await supabase
      .from("BLUEBAY_ITEM")
      .select("*")
      .in("ITEM_CODIGO", itemCodes);

    if (itemsError) {
      console.error("Erro ao buscar informações dos itens:", itemsError);
      throw itemsError;
    }

    // Criar mapa de itens para fácil acesso
    const itemsMap = {};
    itemsData?.forEach(item => {
      itemsMap[item.ITEM_CODIGO] = item;
    });

    // Agrupar dados de faturamento por item
    const itemsGrouped = {};
    
    faturamentoData.forEach(fat => {
      const itemCode = fat.ITEM_CODIGO;
      if (!itemCode) return;
      
      if (!itemsGrouped[itemCode]) {
        itemsGrouped[itemCode] = {
          ITEM_CODIGO: itemCode,
          DESCRICAO: itemsMap[itemCode]?.DESCRICAO || '',
          GRU_DESCRICAO: itemsMap[itemCode]?.GRU_DESCRICAO || 'Sem Grupo',
          TOTAL_QUANTIDADE: 0,
          TOTAL_VALOR: 0,
          OCORRENCIAS: 0
        };
      }
      
      // Somar quantidade e valor
      const quantidade = parseFloat(fat.QUANTIDADE) || 0;
      const valorUnitario = parseFloat(fat.VALOR_UNITARIO) || 0;
      
      itemsGrouped[itemCode].TOTAL_QUANTIDADE += quantidade;
      itemsGrouped[itemCode].TOTAL_VALOR += quantidade * valorUnitario;
      itemsGrouped[itemCode].OCORRENCIAS += 1;
    });

    // Converter o objeto agrupado em um array
    const processedItems = Object.values(itemsGrouped);
    return processedItems;
  } catch (error) {
    console.error("Erro ao processar dados de itens:", error);
    throw error;
  }
}
