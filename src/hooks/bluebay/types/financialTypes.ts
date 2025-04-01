// Financial data interface definitions
export interface FinancialTitle {
  NUMNOTA: string | number;
  DTEMISSAO: string;
  DTVENCIMENTO: string;
  DTPAGTO: string | null;
  VLRDESCONTO: number;
  VLRTITULO: number;
  VLRSALDO: number;
  STATUS: string;
  PES_CODIGO: string | number;
  CLIENTE_NOME: string;
  NUMDOCUMENTO?: string | null;
  MATRIZ?: number;
  FILIAL?: number;
  NUMLCTO?: number;
  ANOBASE?: number;
  DTVENCTO?: string;
  TIPO?: string;
}

export interface ConsolidatedInvoice {
  NOTA: string;
  DATA_EMISSAO: string;
  DATA_VENCIMENTO: string | null;
  STATUS: string;
  VALOR_NOTA: number;
  VALOR_PAGO: number;
  VALOR_SALDO: number;
  PES_CODIGO: number;
  CLIENTE_NOME: string;
}

export interface ClientInfo {
  APELIDO: string | null;
  RAZAOSOCIAL: string | null;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ClientDebtSummary {
  PES_CODIGO: string | number;
  CLIENTE_NOME: string;
  TOTAL_SALDO: number;
  DIAS_VENCIDO_MEDIO: number;
  DIAS_VENCIDO_MAXIMO: number;
  QUANTIDADE_TITULOS: number;
  VALOR_TOTAL: number;
}

export interface CollectionRecord {
  clientCode: string;
  clientName: string;
  collectedBy: string;
  collectionDate: Date;
  status: string;
}
