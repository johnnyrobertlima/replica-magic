
/**
 * Common types and interfaces for cost data handling
 */

// Define a proper interface for the cost data records to avoid type issues
export interface CostDataRecord {
  ITEM_CODIGO?: string;
  item_codigo?: string;
  media_valor_unitario?: number;
  MEDIA_VALOR_UNITARIO?: number;
  total_quantidade?: number;
  TOTAL_QUANTIDADE?: number;
  [key: string]: any; // Allow other properties
}

/**
 * Utility function to get the actual item code regardless of casing
 */
export const getItemCode = (item: Record<string, any>): string | undefined => {
  return item.ITEM_CODIGO || item.item_codigo;
};

/**
 * Utility function to get media valor unitario regardless of casing
 */
export const getMediaValorUnitario = (item: Record<string, any>): number | undefined => {
  return item.media_valor_unitario || item.MEDIA_VALOR_UNITARIO;
};

/**
 * Utility function to get total quantidade regardless of casing
 */
export const getTotalQuantidade = (item: Record<string, any>): number | undefined => {
  return item.total_quantidade || item.TOTAL_QUANTIDADE;
};
