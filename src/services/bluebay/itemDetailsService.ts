
import { supabase } from "@/integrations/supabase/client";
import { fetchBluebayFaturamento } from "./faturamentoService";
import { ItemDetail } from "./types";

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
