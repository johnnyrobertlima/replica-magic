import { Database } from "@/integrations/supabase/types";

export type BkFaturamento = Database["public"]["Tables"]["BLUEBAY_FATURAMENTO"]["Row"];

export interface ConsolidatedInvoice {
  NOTA: string;
  DATA_EMISSAO: string | null;
  PES_CODIGO: number | null;
  STATUS: string | null;
  VALOR_NOTA: number | null;
  ITEMS_COUNT: number;
  CLIENTE_NOME?: string | null;
  FATOR_CORRECAO?: number | null;
}

export interface InvoiceItem {
  NOTA: string;
  ITEM_CODIGO: string | null;
  QUANTIDADE: number | null;
  VALOR_UNITARIO: number | null;
  TIPO: string | null;
  PES_CODIGO: number | null;
  FATOR_CORRECAO?: number | null;
}

export interface FinancialTitle {
  NUMNOTA?: number;
  DTEMISSAO?: string;
  DTVENCIMENTO?: string;
  DTPAGTO?: string;
  VLRDESCONTO?: number;
  VLRTITULO?: number;
  VLRSALDO?: number;
  STATUS?: string;
  PES_CODIGO?: string | number;
  CLIENTE_NOME?: string;
  CENTROCUSTO?: string;
}
