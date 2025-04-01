
import { supabase } from "@/integrations/supabase/client";
import { fetchBluebayFaturamento } from "./faturamentoService";
import { processItemsData } from "./itemDataProcessor";
import { fetchItemDetailsByCentrocusto } from "./clientDetailService";

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

export async function fetchBluebayItemsReport(
  startDate: string,
  endDate: string
): Promise<ItemReport[]> {
  console.log(`Buscando relatório de itens Bluebay...`, { startDate, endDate });

  try {
    // Chamar função para obter os dados
    const faturamentoData = await fetchBluebayFaturamento(startDate, endDate);
    
    // Verificar se os dados retornados são um array
    if (!Array.isArray(faturamentoData)) {
      console.error("Dados de faturamento não são um array:", faturamentoData);
      return [];
    }
    
    // Processar os dados de faturamento em itens
    const processedItems = await processItemsData(faturamentoData, "BLUEBAY");

    console.log(`Itens processados:`, processedItems);
    return processedItems;
  } catch (error) {
    console.error("Erro ao buscar relatório de itens:", error);
    throw error;
  }
}

export async function fetchItemDetails(
  itemCode: string,
  startDate: string,
  endDate: string,
  centrocusto: string = "BLUEBAY"
): Promise<ItemDetail[]> {
  return fetchItemDetailsByCentrocusto(itemCode, startDate, endDate, centrocusto);
}
