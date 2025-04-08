
/**
 * Type definition for cost data records from database
 */
export interface CostDataRecord {
  ITEM_CODIGO: string;
  CUSTO_MEDIO?: number;
  VALOR_VENDA?: number;
  MARGEM?: number;
  DATA_ATUALIZACAO?: string;
}
