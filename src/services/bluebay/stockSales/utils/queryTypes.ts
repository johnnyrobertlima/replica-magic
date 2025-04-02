
import { SupabaseClient } from "@supabase/supabase-js";

// Define table names type for type safety with Supabase
export type SupabaseTable = 
  | "BLUEBAY_ESTOQUE" 
  | "BLUEBAY_ITEM" 
  | "BLUEBAY_FATURAMENTO" 
  | "BLUEBAY_PEDIDO"
  | "BLUEBAY_PESSOA";

// Define condition operators type
export type ConditionOperator = 'gt' | 'lt' | 'gte' | 'lte' | 'in';

// Define condition type
export interface QueryCondition {
  type: ConditionOperator;
  column: string;
  value: any;
}

// Define fetch parameters interface
export interface FetchBatchesParams {
  table: SupabaseTable;
  selectFields: string;
  filters?: Record<string, any>;
  conditions?: QueryCondition[];
  batchSize?: number;
  logPrefix?: string;
}
