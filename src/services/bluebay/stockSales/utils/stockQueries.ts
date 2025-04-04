
/**
 * This file is kept for backward compatibility.
 * It re-exports stock query functions from their dedicated modules.
 */
import { fetchStockData, fetchStockItemsPaginated } from './stock';

export {
  fetchStockData,
  fetchStockItemsPaginated
};
