
import { handleApiError } from "../../errorHandlingService";
import { fetchInBatches } from "../batchQueryExecutor";

/**
 * Fetch paginated purchase data for a date range with TRANSACAO = 200
 */
export const fetchPurchaseDataPaginated = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    console.log(`Iniciando busca paginada de dados de compras para o período ${startDate} a ${endDate}`);
    
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
      logPrefix: "compras paginadas"
    });
    
    console.log(`Total final: ${purchaseData.length} registros de compras carregados`);
    return purchaseData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de compras paginados", error);
    throw error;
  }
};
