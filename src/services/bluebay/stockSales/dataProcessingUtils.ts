
// This is a backward compatibility file that re-exports from the new modular files
// This ensures that any existing imports will continue to work

import { processStockAndSalesData, assignRankings } from './dataProcessing';

export {
  processStockAndSalesData,
  assignRankings
};
