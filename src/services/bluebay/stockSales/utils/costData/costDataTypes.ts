
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

/**
 * Utility function to safely get item code from cost data record
 * regardless of casing
 */
export const getItemCode = (item: Record<string, any>): string => {
  return item.ITEM_CODIGO || item.item_codigo || '';
};

/**
 * Utility function to safely get media valor unitario from cost data record
 * regardless of casing
 */
export const getMediaValorUnitario = (item: Record<string, any>): number | undefined => {
  return item.MEDIA_VALOR_UNITARIO || item.media_valor_unitario;
};

/**
 * Utility function to safely get total quantidade from cost data record
 * regardless of casing
 */
export const getTotalQuantidade = (item: Record<string, any>): number | undefined => {
  return item.TOTAL_QUANTIDADE || item.total_quantidade;
};
