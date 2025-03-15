
// Central export file for all financial service functions
import { fetchBkFaturamentoData, fetchInvoiceItems } from './financialDataService';
import { consolidateByNota } from './financialProcessingService';
import type { BkFaturamento, ConsolidatedInvoice, InvoiceItem } from './types/financialTypes';

export {
  // Data fetching functions
  fetchBkFaturamentoData,
  fetchInvoiceItems,
  
  // Processing functions
  consolidateByNota,
  
  // Types
  BkFaturamento,
  ConsolidatedInvoice,
  InvoiceItem
};
