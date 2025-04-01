
import { fetchBluebayFaturamentoData } from "./api/faturamentoService";
import { processFaturamentoData } from "./processors/itemDataProcessor";
import { getBluebayItemDetails } from "./clients/clientDetailService";

/**
 * Gets Bluebay report items for the specified date range
 */
export const getBluebayReportItems = async (startDate?: string, endDate?: string) => {
  try {
    const formattedStartDate = startDate ? `${startDate}T00:00:00Z` : undefined;
    const formattedEndDate = endDate ? `${endDate}T23:59:59Z` : undefined;

    console.info("Buscando relatório de itens Bluebay...", {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });

    // Buscar dados de faturamento usando a função
    const faturamentoData = await fetchBluebayFaturamentoData(formattedStartDate, formattedEndDate);
    
    // Verificar se os dados são um array antes de processar
    if (!Array.isArray(faturamentoData)) {
      console.error("Dados de faturamento não são um array:", faturamentoData);
      return [];
    }
    
    // Processar os dados para obter itens agrupados com totais
    const processedItems = await processFaturamentoData(faturamentoData);
    console.log("Itens processados:", processedItems);

    return processedItems;
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    throw error;
  }
};

// Exportar as funções específicas para serem utilizadas externamente
export { getBluebayItemDetails };
