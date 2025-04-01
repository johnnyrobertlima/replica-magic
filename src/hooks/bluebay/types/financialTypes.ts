
// Client information from the database
export interface ClientInfo {
  APELIDO?: string;
  RAZAOSOCIAL?: string;
  EMAIL?: string;
}

// Date range for filtering
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Financial title interface
export interface FinancialTitle {
  MATRIZ: number;
  FILIAL: number;
  NUMLCTO: number;
  ANOBASE: number;
  DTEMISSAO: string | null;
  DTVENCIMENTO: string | null;
  DTPAGTO: string | null;
  VLRABATIMENTO: number;
  VLRDESCONTO: number;
  VLRTITULO: number;
  VLRSALDO: number;
  TIPO: string;
  NUMNOTA: number | null;
  PES_CODIGO: string | number;
  NUMDOCUMENTO: string | null;
  STATUS: string;
  CLIENTE_NOME?: string;
  // Data range for filtering
  DTVENCTO?: string | null;
}

// Interface for consolidated invoice
export interface ConsolidatedInvoice {
  NOTA: string;
  DATA_EMISSAO: string;
  DATA_VENCIMENTO: string;
  VALOR_NOTA: number;
  VALOR_PAGO: number;
  VALOR_SALDO: number;
  STATUS: string;
  PES_CODIGO: string | number;
  CLIENTE_NOME: string;
}

// Client debt summary for the collection feature
export interface ClientDebtSummary {
  PES_CODIGO: string | number;
  CLIENTE_NOME: string;
  CLIENTE_EMAIL?: string; // Campo adicionado para armazenar o email do cliente
  TOTAL_SALDO: number;
  QUANTIDADE_TITULOS: number;
  DIAS_VENCIDO_MAX: number;
}

// Collection record interface
export interface CollectionRecord {
  id: string;
  clientCode: string;
  clientName: string;
  status: string;
  date: Date;
  collectedBy: string;
}
