
export interface CostDataRecord {
  ITEM_CODIGO?: string;
  item_codigo?: string; // lowercase variant sometimes returned by API
  MEDIA_VALOR_UNITARIO?: number;
  media_valor_unitario?: number;  // lowercase variant
  TOTAL_QUANTIDADE?: number;
  total_quantidade?: number; // lowercase variant
  [key: string]: any; // Allow for other properties
}

// Helper functions to safely access data regardless of case
export const getItemCode = (record: CostDataRecord): string => {
  return record?.ITEM_CODIGO || record?.item_codigo || '';
};

export const getMediaValorUnitario = (record: CostDataRecord): number => {
  return record?.MEDIA_VALOR_UNITARIO || record?.media_valor_unitario || 0;
};

export const getTotalQuantidade = (record: CostDataRecord): number => {
  return record?.TOTAL_QUANTIDADE || record?.total_quantidade || 0;
};
