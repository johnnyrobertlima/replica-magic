
/**
 * Debug logging utilities for cost data operations
 */

/**
 * Logs a sample of cost data for debugging purposes
 */
export const logCostDataSample = (data: Record<string, any>[]): void => {
  if (data && data.length > 0) {
    console.log("Exemplo de dados retornados da view:", data[0]);
    
    // Check if the field names match what we expect
    const firstItem = data[0];
    const keys = Object.keys(firstItem);
    console.log("Campos disponíveis na view:", keys);
    
    // Log exact field names to confirm case sensitivity
    if ('media_valor_unitario' in firstItem) {
      console.log("Campo media_valor_unitario encontrado com valor:", firstItem.media_valor_unitario);
    } else if ('MEDIA_VALOR_UNITARIO' in firstItem) {
      console.log("Campo MEDIA_VALOR_UNITARIO encontrado com valor:", firstItem.MEDIA_VALOR_UNITARIO);
    } else {
      console.log("Campo de custo médio não encontrado no formato esperado");
      
      // Try to locate a field that might contain the cost data
      const potentialCostField = keys.find(key => 
        key.toLowerCase().includes('valor') || 
        key.toLowerCase().includes('media') || 
        key.toLowerCase().includes('custo')
      );
      
      if (potentialCostField) {
        console.log(`Campo potencial para custo médio: ${potentialCostField} = ${firstItem[potentialCostField]}`);
      }
    }
  }
};

/**
 * Logs detailed information about a specific item for debugging
 */
export const logItemDetails = (data: Record<string, any>[], targetItemCode: string): void => {
  const targetItem = data.find((item: Record<string, any>) => {
    const itemCode = item.ITEM_CODIGO || item.item_codigo;
    return itemCode === targetItemCode || 
          (typeof itemCode === 'string' && itemCode.trim() === targetItemCode);
  });
  
  if (targetItem) {
    console.log(`*** ITEM ESPECÍFICO ENCONTRADO: ${targetItemCode} ***`);
    console.log("Dados completos do item na view:", targetItem);
    
    // Verificar todos os campos que podem conter o valor do custo
    Object.keys(targetItem).forEach(key => {
      if (key.toLowerCase().includes('valor') || 
          key.toLowerCase().includes('media') || 
          key.toLowerCase().includes('custo')) {
        console.log(`Campo ${key}: ${targetItem[key]}`);
      }
    });
  } else {
    console.log(`*** ITEM ${targetItemCode} NÃO ENCONTRADO NA VIEW ***`);
    
    // Tentar buscar nomes similares
    const similarItems = data.filter((item: Record<string, any>) => {
      const codigo = item.ITEM_CODIGO || item.item_codigo || '';
      return typeof codigo === 'string' && codigo.includes(targetItemCode.split('/')[0]);
    });
    
    if (similarItems.length > 0) {
      console.log("Items similares encontrados:", similarItems.map((i: Record<string, any>) => i.ITEM_CODIGO || i.item_codigo));
    }
  }
};
