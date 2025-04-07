
import { logItemDiagnostics } from "./debugLogger";
import { CostDataRecord, getItemCode, getMediaValorUnitario, getTotalQuantidade } from "./costData/costDataTypes";

/**
 * Process cost data from the view to create a lookup map by item code
 */
export const processCostData = (costData: CostDataRecord[]): Map<string, any> => {
  if (!costData || costData.length === 0) {
    console.log("Nenhum dado de custo para processar");
    return new Map();
  }
  
  console.log(`Processando ${costData.length} registros de dados de custo`);
  
  // Log a sample entry to debug data structure
  if (costData.length > 0) {
    console.log("Exemplo de registro de custo:", costData[0]);
  }
  
  const costByItem = new Map<string, any>();
  
  costData.forEach(item => {
    // Use utility functions to get values regardless of casing
    const itemCode = getItemCode(item);
    const mediaValorUnitario = getMediaValorUnitario(item) || 0;
    const totalQuantidade = getTotalQuantidade(item) || 0;
    
    if (!itemCode) {
      return; // Skip if no item code
    }
    
    costByItem.set(itemCode, {
      CUSTO_MEDIO: mediaValorUnitario,
      ENTROU: totalQuantidade,
      teste: mediaValorUnitario // Add the media_valor_unitario as teste field
    });
    
    // Log MS-101/PB specially for debugging
    if (itemCode === 'MS-101/PB') {
      logItemDiagnostics('MS-101/PB', `Dados de custo mapeados: CUSTO_MEDIO=${mediaValorUnitario}, ENTROU=${totalQuantidade}, teste=${mediaValorUnitario}`);
    }
  });
  
  console.log(`Mapeados dados de custo para ${costByItem.size} itens`);
  
  return costByItem;
};

/**
 * Gets the cost for a specific item from the cost map
 */
export const getItemCost = (itemCode: string, costMap: Map<string, any>): any => {
  // First try direct lookup
  if (costMap.has(itemCode)) {
    return costMap.get(itemCode);
  }
  
  // Then try with trimmed code
  const trimmedCode = itemCode.trim();
  if (trimmedCode !== itemCode && costMap.has(trimmedCode)) {
    return costMap.get(trimmedCode);
  }
  
  // Try case-insensitive search
  for (const [key, value] of costMap.entries()) {
    if (key.toLowerCase() === itemCode.toLowerCase()) {
      return value;
    }
  }
  
  // Not found
  return null;
};
