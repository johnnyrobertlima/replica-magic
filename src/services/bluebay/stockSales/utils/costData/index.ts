
// Re-export functions and types from individual files
export { fetchItemCostData } from './fetchItemCostData';
export type { CostDataRecord } from './costDataTypes';
export { getItemCode, getMediaValorUnitario, getTotalQuantidade } from './costDataTypes';

/**
 * Fetches cost data from the view
 */
export const fetchCostDataFromView = async (): Promise<CostDataRecord[]> => {
  try {
    console.log("Fetching cost data from view");
    // Implement the actual function to fetch cost data from the view
    // This is a placeholder implementation
    return [];
  } catch (error) {
    console.error("Error fetching cost data from view:", error);
    return [];
  }
};
