
import { BkFaturamento, ConsolidatedInvoice } from "./types/financialTypes";

/**
 * Consolidates faturamento data by NOTA (invoice number)
 */
export const consolidateByNota = (faturamentoData: BkFaturamento[]): ConsolidatedInvoice[] => {
  // Filter for BK center cost if not already filtered by the API
  const filteredData = faturamentoData.filter(item => item.CENTROCUSTO === 'BK');
  
  const notaMap = new Map<string, ConsolidatedInvoice>();
  
  filteredData.forEach(item => {
    const nota = item.NOTA;
    if (!nota) return;
    
    if (!notaMap.has(nota)) {
      notaMap.set(nota, {
        NOTA: nota,
        DATA_EMISSAO: item.DATA_EMISSAO,
        CLIENTE_NOME: item.CLIENTE_INFO?.APELIDO || item.CLIENTE_INFO?.RAZAOSOCIAL || "Cliente não encontrado",
        CLIENTE_CODIGO: item.PES_CODIGO,
        STATUS: item.STATUS,
        ITENS: [],
        VALOR_TOTAL: 0,
        QUANTIDADE_TOTAL: 0
      });
    }
    
    const consolidatedInvoice = notaMap.get(nota)!;
    
    // Calculate item value
    const itemValue = (item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0);
    
    // Add item to invoice
    consolidatedInvoice.ITENS.push({
      ITEM_CODIGO: item.ITEM_CODIGO || "",
      QUANTIDADE: item.QUANTIDADE || 0,
      VALOR_UNITARIO: item.VALOR_UNITARIO || 0,
      VALOR_TOTAL: itemValue
    });
    
    // Update totals
    consolidatedInvoice.VALOR_TOTAL += itemValue;
    consolidatedInvoice.QUANTIDADE_TOTAL += (item.QUANTIDADE || 0);
  });
  
  return Array.from(notaMap.values());
};
