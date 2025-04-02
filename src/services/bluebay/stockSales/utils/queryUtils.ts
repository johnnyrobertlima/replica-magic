
// Main barrel file that exports all query utilities
import { fetchInBatches } from './batchQueryExecutor';
import { 
  fetchStockData, 
  fetchStockItemsPaginated 
} from './stockQueries';
import { 
  fetchItemDataInBatches, 
  fetchItemDetailsBatch 
} from './itemQueries';
import { 
  fetchSalesDataInBatches, 
  fetchSalesDataPaginated 
} from './salesQueries';
import type { 
  SupabaseTable, 
  ConditionOperator, 
  QueryCondition, 
  FetchBatchesParams 
} from './queryTypes';

export {
  // Types
  type SupabaseTable,
  type ConditionOperator,
  type QueryCondition,
  type FetchBatchesParams,
  
  // Core batch query function
  fetchInBatches,
  
  // Stock queries
  fetchStockData,
  fetchStockItemsPaginated,
  
  // Item queries
  fetchItemDataInBatches,
  fetchItemDetailsBatch,
  
  // Sales queries
  fetchSalesDataInBatches,
  fetchSalesDataPaginated
};
