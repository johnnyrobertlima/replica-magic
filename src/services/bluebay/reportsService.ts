
import { supabase } from "@/integrations/supabase/client";
import { fetchBluebayFaturamento, BluebayFaturamentoItem } from "./faturamentoService";

export interface ItemReport {
  ITEM_CODIGO: string;
  DESCRICAO?: string;
  GRU_DESCRICAO?: string;
  TOTAL_QUANTIDADE: number;
  TOTAL_VALOR: number;
  OCORRENCIAS: number;
}

export interface ItemDetail {
  NOTA: string;
  DATA_EMISSAO: string;
  CLIENTE_NOME: string;
  PES_CODIGO: number;
  QUANTIDADE: number;
  VALOR_UNITARIO: number;
  FATOR_CORRECAO?: number | null;
}

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

export const fetchItemDetails = async (
  itemCode: string,
  startDate: string,
  endDate: string
): Promise<ItemDetail[]> => {
  try {
    // Buscar faturamentos do item com o filtro de data
    const faturamentoData = await fetchBluebayFaturamento(startDate, endDate);
    
    // Filtrar apenas faturamentos do item específico
    const itemFaturamentos = faturamentoData.filter(f => f.ITEM_CODIGO === itemCode);
    
    if (itemFaturamentos.length === 0) {
      return [];
    }
    
    // Obter códigos de clientes para buscar informações
    const clientCodes = [...new Set(itemFaturamentos
      .filter(f => f.PES_CODIGO)
      .map(f => f.PES_CODIGO))];
    
    // Buscar informações dos clientes
    const { data: clientsData, error: clientsError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO,APELIDO,RAZAOSOCIAL,fator_correcao')
      .in('PES_CODIGO', clientCodes);
    
    if (clientsError) {
      console.error("Erro ao buscar informações dos clientes:", clientsError);
      throw clientsError;
    }
    
    // Criar mapa de clientes para fácil acesso
    const clientsMap = new Map();
    clientsData?.forEach(client => {
      clientsMap.set(client.PES_CODIGO, {
        APELIDO: client.APELIDO,
        RAZAOSOCIAL: client.RAZAOSOCIAL,
        FATOR_CORRECAO: client.fator_correcao
      });
    });
    
    // Transformar os faturamentos em detalhes do item
    return itemFaturamentos.map(fatura => {
      const clientInfo = fatura.PES_CODIGO ? clientsMap.get(fatura.PES_CODIGO) || {} : {};
      
      return {
        NOTA: fatura.NOTA || '',
        DATA_EMISSAO: fatura.DATA_EMISSAO || '',
        CLIENTE_NOME: clientInfo.RAZAOSOCIAL || clientInfo.APELIDO || 'Cliente não identificado',
        PES_CODIGO: fatura.PES_CODIGO || 0,
        QUANTIDADE: fatura.QUANTIDADE || 0,
        VALOR_UNITARIO: fatura.VALOR_UNITARIO || 0,
        FATOR_CORRECAO: clientInfo.FATOR_CORRECAO || null
      };
    });
  } catch (error) {
    console.error(`Erro ao buscar detalhes do item ${itemCode}:`, error);
    return [];
  }
};
