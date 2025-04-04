
import { handleApiError } from "../../errorHandlingService";
import { fetchInBatches } from "../batchQueryExecutor";

/**
 * Fetch sales data in batches for a specified date range
 */
export const fetchSalesDataInBatches = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    console.log(`Buscando dados de vendas para o período ${startDate} até ${endDate}`);
    
    const salesData = await fetchInBatches({
      table: "BLUEBAY_FATURAMENTO",
      selectFields: `
        "ITEM_CODIGO",
        "QUANTIDADE",
        "VALOR_UNITARIO",
        "DATA_EMISSAO",
        "TIPO"
      `,
      filters: { TIPO: 'S' },
      conditions: [
        { type: 'gte', column: 'DATA_EMISSAO', value: startDate },
        { type: 'lte', column: 'DATA_EMISSAO', value: `${endDate}T23:59:59` }
      ],
      batchSize: 5000,
      logPrefix: "vendas"
    });
    
    console.log(`Total de ${salesData.length} registros de vendas encontrados`);
    return salesData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de vendas em lote", error);
    throw error;
  }
};

/**
 * Fetch purchase data (cost) in batches for items
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
      conditions: [
        { type: 'eq', column: 'TIPO', value: 'E' },
        { type: 'eq', column: 'TRANSACAO', value: 200 },
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
