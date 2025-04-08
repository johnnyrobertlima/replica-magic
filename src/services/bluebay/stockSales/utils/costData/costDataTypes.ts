
/**
 * Simplified type for cost data records
 * Using a Record type to avoid excessive type depth issues
 */
export type CostDataRecord = Record<string, any>;

/**
 * Helper function to get the item code from the record
 * Handles case-insensitive field names
 */
export function getItemCode(record: CostDataRecord): string | null {
  return record.ITEM_CODIGO || record.item_codigo || null;
}

/**
 * Helper function to get the media valor unitario from the record
 * Handles case-insensitive field names
 */
export function getMediaValorUnitario(record: CostDataRecord): number | null {
  return record.MEDIA_VALOR_UNITARIO || record.media_valor_unitario || null;
}

/**
 * Helper function to get the total quantidade from the record
 * Handles case-insensitive field names
 */
export function getTotalQuantidade(record: CostDataRecord): number | null {
  return record.TOTAL_QUANTIDADE || record.total_quantidade || record.ENTROU || record.entrou || null;
}
