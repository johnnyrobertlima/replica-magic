
/**
 * This file re-exports the order processing utilities from their dedicated modules
 * to maintain backward compatibility while keeping the codebase modular.
 */

// Re-export all functions from their dedicated modules
export { processOrdersData } from './processing/orderDataProcessor';
export { groupOrdersByNumber } from './processing/orderGrouper';
export { processClientOrdersData } from './processing/clientOrdersProcessor';
