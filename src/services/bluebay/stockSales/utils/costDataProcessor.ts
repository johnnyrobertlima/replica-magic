
/**
 * Utility functions to process cost data for stock analytics
 */

import { logDebugInfo, logItemDiagnostics } from "./debugLogger";

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
  const targetItemCost = costData.find(item => {
    if (!item) return false;
    const itemCode = item.ITEM_CODIGO || item.item_codigo || '';
    return itemCode.trim() === 'MS-101/PB';
  });
  
  if (targetItemCost) {
    logItemDiagnostics("MS-101/PB", "ENCONTRADO NOS DADOS DE CUSTO", targetItemCost);
    logDebugInfo("Dados completos:", targetItemCost);
  } else {
    logItemDiagnostics("MS-101/PB", "NÃO ENCONTRADO NOS DADOS DE CUSTO");
  }
  
  costData.forEach(item => {
    if (!item) {
      console.warn("Item nulo encontrado nos dados de custo");
      return;
    }

    // Tente obter o código do item de várias maneiras possíveis
    const itemCode = (item.ITEM_CODIGO || item.item_codigo || '').trim();
    
    if (!itemCode) {
      console.warn("Item sem código encontrado nos dados de custo:", item);
      return;
    }
    
    // Flag para registro especial se for o item que estamos diagnosticando
    const isTargetItem = itemCode === 'MS-101/PB';
    
    if (isTargetItem) {
      logItemDiagnostics("MS-101/PB", "Processando item específico");
    }
    
    // Attempt to get the cost value based on possible field names
    let custoMedio = 0;
    let qtdEntrou = 0;
    
    // Handle media_valor_unitario field (check various possible case variations)
    if ('media_valor_unitario' in item && item.media_valor_unitario !== null) {
      custoMedio = Number(item.media_valor_unitario);
      if (isTargetItem) logItemDiagnostics("MS-101/PB", `Usando media_valor_unitario: ${custoMedio}`);
    } else if ('MEDIA_VALOR_UNITARIO' in item && item.MEDIA_VALOR_UNITARIO !== null) {
      custoMedio = Number(item.MEDIA_VALOR_UNITARIO);
      if (isTargetItem) logItemDiagnostics("MS-101/PB", `Usando MEDIA_VALOR_UNITARIO: ${custoMedio}`);
    } else if ('valorMedio' in item && item.valorMedio !== null) {
      custoMedio = Number(item.valorMedio);
      if (isTargetItem) logItemDiagnostics("MS-101/PB", `Usando valorMedio: ${custoMedio}`);
    } else if ('VALOR_MEDIO' in item && item.VALOR_MEDIO !== null) {
      custoMedio = Number(item.VALOR_MEDIO);
      if (isTargetItem) logItemDiagnostics("MS-101/PB", `Usando VALOR_MEDIO: ${custoMedio}`);
    } else {
      // Try to find a field that might contain cost value
      const costFields = Object.keys(item).filter(key => 
        key.toLowerCase().includes('valor') && 
        (key.toLowerCase().includes('medio') || 
        key.toLowerCase().includes('media') ||
        key.toLowerCase().includes('custo'))
      );
      
      if (costFields.length > 0) {
        for (const field of costFields) {
          if (item[field] !== null && !isNaN(Number(item[field]))) {
            custoMedio = Number(item[field]);
            if (isTargetItem) logItemDiagnostics("MS-101/PB", `Encontrado campo alternativo para custo: ${field} = ${custoMedio}`);
            break;
          }
        }
      } else if (isTargetItem) {
        logItemDiagnostics("MS-101/PB", `Não foi possível encontrar o campo de custo médio`);
        logDebugInfo("Campos disponíveis:", Object.keys(item));
      }
    }
    
    // Handle total_quantidade field (check various possible case variations)
    if ('total_quantidade' in item && item.total_quantidade !== null) {
      qtdEntrou = Number(item.total_quantidade);
      if (isTargetItem) logItemDiagnostics("MS-101/PB", `Usando total_quantidade: ${qtdEntrou}`);
    } else if ('TOTAL_QUANTIDADE' in item && item.TOTAL_QUANTIDADE !== null) {
      qtdEntrou = Number(item.TOTAL_QUANTIDADE);
      if (isTargetItem) logItemDiagnostics("MS-101/PB", `Usando TOTAL_QUANTIDADE: ${qtdEntrou}`);
    } else if ('quantidade' in item && item.quantidade !== null) {
      qtdEntrou = Number(item.quantidade);
      if (isTargetItem) logItemDiagnostics("MS-101/PB", `Usando quantidade: ${qtdEntrou}`);
    } else if ('QUANTIDADE' in item && item.QUANTIDADE !== null) {
      qtdEntrou = Number(item.QUANTIDADE);
      if (isTargetItem) logItemDiagnostics("MS-101/PB", `Usando QUANTIDADE: ${qtdEntrou}`);
    } else {
      // Try to find a field that might contain quantity value
      const quantityFields = Object.keys(item).filter(key => 
        key.toLowerCase().includes('quantidade') || 
        key.toLowerCase().includes('qty') ||
        key.toLowerCase().includes('quant')
      );
      
      if (quantityFields.length > 0) {
        for (const field of quantityFields) {
          if (item[field] !== null && !isNaN(Number(item[field]))) {
            qtdEntrou = Number(item[field]);
            if (isTargetItem) logItemDiagnostics("MS-101/PB", `Encontrado campo alternativo para quantidade: ${field} = ${qtdEntrou}`);
            break;
          }
        }
      } else if (isTargetItem) {
        logItemDiagnostics("MS-101/PB", `Não foi possível encontrar o campo de quantidade`);
      }
    }
    
    // Garantir que valores NaN sejam tratados como zero
    custoMedio = isNaN(custoMedio) ? 0 : custoMedio;
    qtdEntrou = isNaN(qtdEntrou) ? 0 : qtdEntrou;
    
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
  
  // Log diagnostic info for MS-101/PB specifically
  const ms101PbCost = costByItem.get('MS-101/PB');
  if (ms101PbCost) {
    console.log('======== DIAGNÓSTICO FINAL ========');
    console.log(`MS-101/PB: Custo médio = ${ms101PbCost.CUSTO_MEDIO}, Qtd = ${ms101PbCost.ENTROU}`);
    console.log('==================================');
  } else {
    console.log('======== DIAGNÓSTICO FINAL ========');
    console.log('MS-101/PB: NÃO ENCONTRADO NO MAPA DE CUSTOS FINAL');
    console.log('==================================');
  }
  
  return costByItem;
};

/**
 * Função específica para buscar o custo de um item diretamente
 */
export const getItemCost = (item: string, costMap: Map<string, any>): {CUSTO_MEDIO: number, ENTROU: number} => {
  if (!item) return { CUSTO_MEDIO: 0, ENTROU: 0 };
  
  // Limpar o código do item de possíveis espaços
  const cleanItemCode = item.trim();
  
  // Verificar se temos o item no mapa de custos
  if (costMap.has(cleanItemCode)) {
    const costData = costMap.get(cleanItemCode);
    
    if (cleanItemCode === 'MS-101/PB') {
      console.log(`DIAGNÓSTICO CUSTO: Encontrado custo para MS-101/PB: ${JSON.stringify(costData)}`);
    }
    
    return costData;
  }
  
  // Não encontrado - tentar buscar com outras variações de case
  const allKeys = Array.from(costMap.keys());
  const matchingKey = allKeys.find(key => 
    key.toLowerCase() === cleanItemCode.toLowerCase()
  );
  
  if (matchingKey) {
    const costData = costMap.get(matchingKey);
    if (cleanItemCode === 'MS-101/PB') {
      console.log(`DIAGNÓSTICO CUSTO: Encontrado custo para MS-101/PB com case diferente (${matchingKey}): ${JSON.stringify(costData)}`);
    }
    return costData;
  }
  
  // Ainda não encontrado, registrar diagnóstico para itens específicos
  if (cleanItemCode === 'MS-101/PB') {
    console.log(`DIAGNÓSTICO CUSTO: MS-101/PB NÃO ENCONTRADO no mapa de custos!`);
    console.log(`Mapa contém ${costMap.size} itens.`);
    
    // Verificar se há itens similares
    const similarKeys = allKeys.filter(key => 
      key.includes('MS-101') || key.toLowerCase().includes('ms-101')
    );
    
    if (similarKeys.length > 0) {
      console.log(`Códigos similares encontrados: ${similarKeys.join(', ')}`);
      similarKeys.forEach(key => {
        console.log(`Custo para ${key}: ${JSON.stringify(costMap.get(key))}`);
      });
    }
  }
  
  return { CUSTO_MEDIO: 0, ENTROU: 0 };
};
