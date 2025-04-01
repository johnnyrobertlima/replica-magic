
import { supabase } from "@/integrations/supabase/client";
import { ItemDetail } from "./reportsService";

/**
 * Busca detalhes de itens por cliente para um código de item e período específicos
 */
export async function fetchItemDetailsByCentrocusto(
  itemCode: string, 
  startDate: string, 
  endDate: string,
  centrocusto: string = "BLUEBAY"
): Promise<ItemDetail[]> {
  try {
    // Converter datas para formato ISO
    const startIso = new Date(startDate).toISOString();
    const endIso = `${new Date(endDate).toISOString().split('T')[0]}T23:59:59Z`;
    
    console.log(`Buscando detalhes do item ${itemCode} para ${centrocusto}...`, { 
      startDate: startIso, 
      endDate: endIso 
    });

    // Consultar faturamento para o item
    const { data: faturamentoData, error: fatError } = await supabase
      .from("BLUEBAY_FATURAMENTO")
      .select(`
        NOTA,
        DATA_EMISSAO,
        PES_CODIGO,
        QUANTIDADE,
        VALOR_UNITARIO
      `)
      .eq("ITEM_CODIGO", itemCode)
      .eq("CENTROCUSTO", centrocusto)
      .gte("DATA_EMISSAO", startIso)
      .lte("DATA_EMISSAO", endIso);

    if (fatError) {
      console.error("Erro ao buscar detalhes do faturamento:", fatError);
      throw fatError;
    }

    if (!faturamentoData || faturamentoData.length === 0) {
      console.log(`Nenhum detalhe encontrado para o item ${itemCode} no período especificado`);
      return [];
    }

    // Obter códigos de cliente únicos
    const clientCodes = [...new Set(faturamentoData.map(item => item.PES_CODIGO))];
    
    // Buscar informações dos clientes
    const { data: clientsData, error: clientsError } = await supabase
      .from("BLUEBAY_PESSOA")
      .select("PES_CODIGO, APELIDO, RAZAOSOCIAL, fator_correcao")
      .in("PES_CODIGO", clientCodes);

    if (clientsError) {
      console.error("Erro ao buscar informações dos clientes:", clientsError);
      throw clientsError;
    }

    // Criar mapa de clientes para fácil acesso
    const clientsMap: Record<string, any> = {};
    clientsData?.forEach(client => {
      clientsMap[String(client.PES_CODIGO)] = client;
    });

    // Montar os detalhes com as informações do cliente
    const itemDetails = faturamentoData.map(fat => {
      const pesCodigoStr = String(fat.PES_CODIGO || '');
      const client = clientsMap[pesCodigoStr] || {};
      return {
        NOTA: fat.NOTA || '',
        DATA_EMISSAO: fat.DATA_EMISSAO || '',
        CLIENTE_NOME: client.APELIDO || client.RAZAOSOCIAL || `Cliente ${fat.PES_CODIGO}`,
        PES_CODIGO: fat.PES_CODIGO || 0,
        QUANTIDADE: parseFloat(fat.QUANTIDADE) || 0,
        VALOR_UNITARIO: parseFloat(fat.VALOR_UNITARIO) || 0,
        FATOR_CORRECAO: client.fator_correcao || null
      };
    });

    return itemDetails;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do item ${itemCode}:`, error);
    throw error;
  }
}
