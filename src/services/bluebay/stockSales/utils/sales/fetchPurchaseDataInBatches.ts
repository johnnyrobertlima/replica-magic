
import { handleApiError } from "../../errorHandlingService";
import { fetchInBatches } from "../batchQueryExecutor";

/**
 * Fetch purchase data in batches for a specified date range
 * This specifically queries records with TIPO = 'E' and TRANSACAO = 200
 */
export const fetchPurchaseDataInBatches = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    console.log(`Buscando dados de compras para o período ${startDate} até ${endDate}`);
    
    const purchaseData = await fetchInBatches({
      table: "BLUEBAY_FATURAMENTO",
      selectFields: `
        "ITEM_CODIGO",
        "QUANTIDADE",
        "VALOR_UNITARIO",
        "DATA_EMISSAO"
      `,
      filters: { 
        TIPO: 'E',
        TRANSACAO: 200
      },
      conditions: [
        { type: 'gte', column: 'DATA_EMISSAO', value: startDate },
        { type: 'lte', column: 'DATA_EMISSAO', value: `${endDate}T23:59:59` }
      ],
      batchSize: 5000,
      logPrefix: "compras"
    });
    
    console.log(`Total de ${purchaseData.length} registros de compras encontrados`);
    return purchaseData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de compras em lote", error);
    throw error;
  }
};
