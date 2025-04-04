
// Interface definitions for batch querying
export type SupabaseTable = string;

export type QueryCondition = {
  type: 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  column: string;
  value: any;
};

export interface FetchBatchesParams {
  table: SupabaseTable;
  selectFields: string;
  filters?: Record<string, any>;
  conditions?: QueryCondition[];
  batchSize?: number;
  logPrefix?: string;
  count?: boolean;
}
