
import { BkFaturamento, ConsolidatedInvoice } from "./types/financialTypes";

/**
 * Consolidates invoice data by NOTA, applying correction factors where available
 */
export const consolidateByNota = (data: BkFaturamento[]): ConsolidatedInvoice[] => {
  console.log(`Consolidating ${data.length} items by NOTA`);
  const invoiceMap = new Map<string, ConsolidatedInvoice>();
  
  data.forEach(item => {
    if (!item.NOTA) return;
    
    // Obtém o fator de correção do cliente (se disponível)
    const clienteInfo = (item as any).CLIENTE_INFO;
    const fatorCorrecao = clienteInfo?.FATOR_CORRECAO || null;
    
    // Aplica o fator de correção ao valor unitário se existir e for maior que 0
    const valorUnitario = item.VALOR_UNITARIO || 0;
    const valorUnitarioAjustado = (fatorCorrecao && fatorCorrecao > 0) 
      ? valorUnitario * fatorCorrecao 
      : valorUnitario;
    
    // Calcula o valor do item com o fator de correção aplicado
    const itemValue = (item.QUANTIDADE || 0) * valorUnitarioAjustado;
    
    const existingInvoice = invoiceMap.get(item.NOTA);
    
    if (existingInvoice) {
      existingInvoice.ITEMS_COUNT += 1;
      existingInvoice.VALOR_NOTA = (existingInvoice.VALOR_NOTA || 0) + itemValue;
    } else {
      const clienteNome = clienteInfo ? 
        (clienteInfo.APELIDO || clienteInfo.RAZAOSOCIAL || null) : null;
      
      invoiceMap.set(item.NOTA, {
        NOTA: item.NOTA,
        DATA_EMISSAO: item.DATA_EMISSAO ? new Date(item.DATA_EMISSAO).toISOString() : null,
        PES_CODIGO: item.PES_CODIGO,
        STATUS: item.STATUS,
        VALOR_NOTA: itemValue,
        ITEMS_COUNT: 1,
        CLIENTE_NOME: clienteNome,
        FATOR_CORRECAO: fatorCorrecao
      });
    }
  });
  
  console.log(`Consolidated into ${invoiceMap.size} invoices`);
  return Array.from(invoiceMap.values());
};
