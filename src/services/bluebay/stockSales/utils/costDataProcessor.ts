
/**
 * Utility functions to process cost data for stock analytics
 */

import { logDebugInfo } from "./debugLogger";

/**
 * Processes cost data records and creates a map for lookup
 */
export const processCostData = (costData: any[]) => {
  // Create a map of cost data by item code
  const costByItem = new Map();
  
  logDebugInfo("Processando dados de custo:", costData.length, "registros");
  
  if (costData.length > 0) {
    logDebugInfo("Amostra de dados de custo:", costData[0]);
    logDebugInfo("Campos disponíveis:", Object.keys(costData[0]));
  }

  // Verificar se item específico existe nos dados de custo
  const targetItemCost = costData.find(item => 
    (item.ITEM_CODIGO === 'MS-101/PB' || item.item_codigo === 'MS-101/PB')
  );
  
  if (targetItemCost) {
    logDebugInfo("*** ITEM MS-101/PB ENCONTRADO NOS DADOS DE CUSTO ***");
    logDebugInfo("Dados completos:", targetItemCost);
  } else {
    logDebugInfo("*** ITEM MS-101/PB NÃO ENCONTRADO NOS DADOS DE CUSTO ***");
  }
  
  costData.forEach(item => {
    if (!item) {
      console.warn("Item nulo encontrado nos dados de custo");
      return;
    }

    // Tente obter o código do item de várias maneiras possíveis
    const itemCode = item.ITEM_CODIGO || item.item_codigo;
    
    if (!itemCode) {
      console.warn("Item sem código encontrado nos dados de custo:", item);
      return;
    }
    
    // Flag para registro especial se for o item que estamos diagnosticando
    const isTargetItem = itemCode === 'MS-101/PB';
    
    if (isTargetItem) {
      logDebugInfo("Processando item específico MS-101/PB");
    }
    
    // Attempt to get the cost value based on possible field names
    let custoMedio = 0;
    let qtdEntrou = 0;
    
    // Handle media_valor_unitario field (check various possible case variations)
    if ('media_valor_unitario' in item) {
      custoMedio = Number(item.media_valor_unitario);
      if (isTargetItem) logDebugInfo(`Usando media_valor_unitario: ${custoMedio}`);
    } else if ('MEDIA_VALOR_UNITARIO' in item) {
      custoMedio = Number(item.MEDIA_VALOR_UNITARIO);
      if (isTargetItem) logDebugInfo(`Usando MEDIA_VALOR_UNITARIO: ${custoMedio}`);
    } else if ('valorMedio' in item) {
      custoMedio = Number(item.valorMedio);
      if (isTargetItem) logDebugInfo(`Usando valorMedio: ${custoMedio}`);
    } else if ('VALOR_MEDIO' in item) {
      custoMedio = Number(item.VALOR_MEDIO);
      if (isTargetItem) logDebugInfo(`Usando VALOR_MEDIO: ${custoMedio}`);
    } else {
      // Try to find a field that might contain cost value
      const costField = Object.keys(item).find(key => 
        key.toLowerCase().includes('valor') && 
        key.toLowerCase().includes('medio') || 
        key.toLowerCase().includes('media') ||
        key.toLowerCase().includes('custo')
      );
      
      if (costField) {
        custoMedio = Number(item[costField]);
        if (isTargetItem) logDebugInfo(`Encontrado campo alternativo para custo: ${costField} = ${custoMedio}`);
      } else if (isTargetItem) {
        console.warn(`Não foi possível encontrar o campo de custo médio para o item MS-101/PB`);
        logDebugInfo("Campos disponíveis:", Object.keys(item));
      }
    }
    
    // Handle total_quantidade field (check various possible case variations)
    if ('total_quantidade' in item) {
      qtdEntrou = Number(item.total_quantidade);
      if (isTargetItem) logDebugInfo(`Usando total_quantidade: ${qtdEntrou}`);
    } else if ('TOTAL_QUANTIDADE' in item) {
      qtdEntrou = Number(item.TOTAL_QUANTIDADE);
      if (isTargetItem) logDebugInfo(`Usando TOTAL_QUANTIDADE: ${qtdEntrou}`);
    } else if ('quantidade' in item) {
      qtdEntrou = Number(item.quantidade);
      if (isTargetItem) logDebugInfo(`Usando quantidade: ${qtdEntrou}`);
    } else if ('QUANTIDADE' in item) {
      qtdEntrou = Number(item.QUANTIDADE);
      if (isTargetItem) logDebugInfo(`Usando QUANTIDADE: ${qtdEntrou}`);
    } else {
      // Try to find a field that might contain quantity value
      const quantityField = Object.keys(item).find(key => 
        key.toLowerCase().includes('quantidade') || 
        key.toLowerCase().includes('qty') ||
        key.toLowerCase().includes('quant'));
      
      if (quantityField) {
        qtdEntrou = Number(item[quantityField]);
        if (isTargetItem) logDebugInfo(`Encontrado campo alternativo para quantidade: ${quantityField} = ${qtdEntrou}`);
      } else if (isTargetItem) {
        console.warn(`Não foi possível encontrar o campo de quantidade para o item MS-101/PB`);
      }
    }
    
    // Store values in the map
    costByItem.set(itemCode, {
      CUSTO_MEDIO: custoMedio,
      ENTROU: qtdEntrou
    });
    
    // Log some data for verification
    if (costByItem.size <= 5 || isTargetItem) {
      logDebugInfo(`Custo mapeado para item ${itemCode}: CUSTO_MEDIO=${custoMedio}, ENTROU=${qtdEntrou}`);
    }
  });
  
  return costByItem;
};
