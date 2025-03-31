
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
}

export interface ConsolidatedInvoice {
  NOTA: string;
  DATA_EMISSAO: string;
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
