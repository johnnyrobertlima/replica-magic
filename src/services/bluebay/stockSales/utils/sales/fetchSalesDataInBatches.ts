
import { handleApiError } from "../../errorHandlingService";
import { fetchInBatches } from "../batchQueryExecutor";

/**
 * Fetch sales data in batches for a date range
 */
export const fetchSalesDataInBatches = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    console.log(`Buscando dados de vendas em lotes para o período ${startDate} a ${endDate}`);
    
    const salesData = await fetchInBatches({
      table: "BLUEBAY_FATURAMENTO",
      selectFields: "*",
      filters: { TIPO: "S" },
      conditions: [
        { type: 'gte', column: 'DATA_EMISSAO', value: startDate },
        { type: 'lte', column: 'DATA_EMISSAO', value: `${endDate}T23:59:59` }
      ],
      batchSize: 5000,
      logPrefix: "vendas em lotes"
    });
    
    console.log(`Total de ${salesData.length} registros de vendas carregados`);
    return salesData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de vendas em lotes", error);
    throw error;
  }
};

/**
 * Fetch purchase data in batches for a date range
 * Retrieves entries with TIPO = 'E' and TRANSACAO = 200
 */
export const fetchPurchaseDataInBatches = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    console.log(`Buscando dados de compras em lotes para o período ${startDate} a ${endDate}`);
    
    const purchaseData = await fetchInBatches({
      table: "BLUEBAY_FATURAMENTO",
      selectFields: "*",
      filters: { TIPO: "E" },
      conditions: [
        { type: 'gte', column: 'DATA_EMISSAO', value: startDate },
        { type: 'lte', column: 'DATA_EMISSAO', value: `${endDate}T23:59:59` },
        { type: 'eq', column: 'TRANSACAO', value: 200 }
      ],
      batchSize: 5000,
      logPrefix: "compras em lotes"
    });
    
    console.log(`Total de ${purchaseData.length} registros de compras carregados`);
    return purchaseData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de compras em lotes", error);
    throw error;
  }
};

