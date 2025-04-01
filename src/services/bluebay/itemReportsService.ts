
import { supabase } from "@/integrations/supabase/client";
import { fetchBluebayFaturamento } from "./faturamentoService";
import { ItemReport } from "./types";

export const fetchBluebayItemsReport = async (
  startDate: string,
  endDate: string
): Promise<ItemReport[]> => {
  try {
    console.log("Buscando relatório de itens Bluebay...", {
      startDate,
      endDate
    });
    
    // Buscar dados de faturamento com filtro de data
    const faturamentoData = await fetchBluebayFaturamento(startDate, endDate);
    
    if (!Array.isArray(faturamentoData) || faturamentoData.length === 0) {
      console.info("Nenhum dado de faturamento encontrado para o período");
      return [];
    }
    
    console.log(`Processando ${faturamentoData.length} registros de faturamento`);
    
    // Obter códigos de itens únicos do faturamento
    const itemCodes = [...new Set(faturamentoData
      .filter(item => item.ITEM_CODIGO)
      .map(item => item.ITEM_CODIGO))];
    
    if (itemCodes.length === 0) {
      console.info("Nenhum item encontrado no faturamento");
      return [];
    }
    
    console.log(`Encontrados ${itemCodes.length} códigos de itens únicos`);
    
    // Buscar informações dos itens no BLUEBAY_ITEM
    const { data: itemsData, error: itemsError } = await supabase
      .from('BLUEBAY_ITEM')
      .select('*')
      .in('ITEM_CODIGO', itemCodes);
    
    if (itemsError) {
      console.error("Erro ao buscar informações dos itens:", itemsError);
      throw itemsError;
    }
    
    console.log(`Carregadas informações de ${itemsData?.length || 0} itens`);
    
    // Mapear itens com suas informações
    const itemsMap = new Map();
    itemsData?.forEach(item => {
      itemsMap.set(item.ITEM_CODIGO, {
        DESCRICAO: item.DESCRICAO,
        GRU_DESCRICAO: item.GRU_DESCRICAO
      });
    });
    
    // Agrupar faturamento por item e calcular totais
    const itemReports: { [key: string]: ItemReport } = {};
    
    faturamentoData.forEach(fatura => {
      if (!fatura.ITEM_CODIGO) return;
      
      const itemCode = fatura.ITEM_CODIGO;
      const quantidade = fatura.QUANTIDADE || 0;
      const valorTotal = fatura.VALOR_UNITARIO ? quantidade * fatura.VALOR_UNITARIO : 0;
      
      if (!itemReports[itemCode]) {
        const itemInfo = itemsMap.get(itemCode) || {};
        itemReports[itemCode] = {
          ITEM_CODIGO: itemCode,
          DESCRICAO: itemInfo.DESCRICAO || '',
          GRU_DESCRICAO: itemInfo.GRU_DESCRICAO || '',
          TOTAL_QUANTIDADE: 0,
          TOTAL_VALOR: 0,
          OCORRENCIAS: 0
        };
      }
      
      itemReports[itemCode].TOTAL_QUANTIDADE += quantidade;
      itemReports[itemCode].TOTAL_VALOR += valorTotal;
      itemReports[itemCode].OCORRENCIAS += 1;
    });
    
    const result = Object.values(itemReports);
    console.log(`Gerado relatório com ${result.length} itens`);
    return result;
  } catch (error) {
    console.error("Erro ao buscar relatório de itens:", error);
    throw error;
  }
};
