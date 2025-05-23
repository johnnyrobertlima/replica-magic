
import { ConsolidatedInvoice, ClientInfo } from "../types/financialTypes";
import { getClientName, pesCodigoToNumber } from "./clientDataUtils";

// Determine invoice value from available properties
export const determineInvoiceValue = (item: any): number => {
  let invoiceValue = 0;
  
  if ('VALOR_TOTAL' in item && item.VALOR_TOTAL) {
    invoiceValue = parseFloat(String(item.VALOR_TOTAL));
  } else if ('TOTAL' in item && item.TOTAL) {
    invoiceValue = parseFloat(String(item.TOTAL));
  } else if ('VALOR' in item && item.VALOR) {
    invoiceValue = parseFloat(String(item.VALOR));
  } else if ('VALOR_NOTA' in item && item.VALOR_NOTA) {
    invoiceValue = parseFloat(String(item.VALOR_NOTA));
  }
  
  return invoiceValue;
};

// Create a consolidated invoice object
export const createConsolidatedInvoice = (
  item: any,
  clientesMap: Record<string | number, ClientInfo>
): ConsolidatedInvoice => {
  const pesCodeNumeric = pesCodigoToNumber(item.PES_CODIGO);
  const pesCodeKey = String(pesCodeNumeric);
  const clienteInfo = clientesMap[pesCodeKey];
  const clientName = getClientName(clienteInfo);
  
  // Determine invoice value
  const invoiceValue = determineInvoiceValue(item);
  
  // Get data_emissao if it exists
  const dataEmissao = item.DATA_EMISSAO || "";
  
  return {
    NOTA: String(item.NOTA || ""),
    DATA_EMISSAO: dataEmissao,
    DATA_VENCIMENTO: null, // Will be populated from titles
    STATUS: item.STATUS || "1", // Default to "Em Aberto"
    VALOR_NOTA: invoiceValue,
    VALOR_PAGO: 0, // We'll calculate this from titles
    VALOR_SALDO: invoiceValue,
    PES_CODIGO: pesCodeNumeric,
    CLIENTE_NOME: clientName || `Cliente ${pesCodeNumeric}`
  };
};

// Update invoice values based on related titles
export const updateInvoiceWithTitles = (
  invoice: ConsolidatedInvoice,
  titulo: any
): ConsolidatedInvoice => {
  // Calculate paid amount based on title values
  const paidAmount = (titulo.VLRTITULO || 0) - (titulo.VLRSALDO || 0);
  invoice.VALOR_PAGO += paidAmount;
  invoice.VALOR_SALDO = invoice.VALOR_NOTA - invoice.VALOR_PAGO;
  
  // Update status based on payment
  if (invoice.VALOR_PAGO >= invoice.VALOR_NOTA) {
    invoice.STATUS = "3"; // Pago
  } else if (invoice.VALOR_PAGO > 0) {
    invoice.STATUS = "2"; // Parcialmente Pago
  } else {
    invoice.STATUS = "1"; // Em Aberto
  }
  
  return invoice;
};
