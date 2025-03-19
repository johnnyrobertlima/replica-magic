
import { BkFaturamento, ConsolidatedInvoice } from "./types/financialTypes";

/**
 * Consolidates faturamento data by NOTA (invoice number)
 */
export const consolidateByNota = (faturamentoData: BkFaturamento[]): ConsolidatedInvoice[] => {
  const notaMap = new Map<string, ConsolidatedInvoice>();
  
  faturamentoData.forEach(item => {
    const nota = item.NOTA;
    if (!nota) return;
    
    if (!notaMap.has(nota)) {
      notaMap.set(nota, {
        NOTA: nota,
        DATA_EMISSAO: item.DATA_EMISSAO,
        CLIENTE_NOME: (item as any).CLIENTE_INFO?.APELIDO || (item as any).CLIENTE_INFO?.RAZAOSOCIAL || "Cliente não encontrado",
        PES_CODIGO: item.PES_CODIGO,
        STATUS: item.STATUS,
        ITEMS_COUNT: 0,
        VALOR_NOTA: 0
      });
    }
    
    const consolidatedInvoice = notaMap.get(nota)!;
    
    // Calculate item value
    const itemValue = (item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0);
    
    // Update totals
    consolidatedInvoice.VALOR_NOTA = (consolidatedInvoice.VALOR_NOTA || 0) + itemValue;
    consolidatedInvoice.ITEMS_COUNT = (consolidatedInvoice.ITEMS_COUNT || 0) + 1;
  });
  
  return Array.from(notaMap.values());
};
