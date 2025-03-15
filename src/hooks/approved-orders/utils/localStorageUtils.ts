
import { ApprovedOrder } from '../types';

// Local Storage key prefix
const LOCAL_STORAGE_KEY_PREFIX = 'approved_orders';

// Save approved orders to local storage
export const saveOrdersToLocalStorage = (
  orders: ApprovedOrder[],
  year: number,
  month: number
): void => {
  try {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}_${year}_${month}`;
    localStorage.setItem(key, JSON.stringify(orders));
    console.log(`Saved ${orders.length} orders to local storage for ${year}-${month}`);
  } catch (error) {
    console.error('Error saving orders to local storage:', error);
  }
};

// Load approved orders from local storage
export const loadOrdersFromLocalStorage = (
  year: number,
  month: number
): ApprovedOrder[] => {
  try {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}_${year}_${month}`;
    const ordersString = localStorage.getItem(key);
    
    if (!ordersString) {
      console.log(`No orders found in local storage for ${year}-${month}`);
      return [];
    }
    
    const orders = JSON.parse(ordersString) as ApprovedOrder[];
    console.log(`Loaded ${orders.length} orders from local storage for ${year}-${month}`);
    return orders;
  } catch (error) {
    console.error('Error loading orders from local storage:', error);
    return [];
  }
};

// Re-export from supabaseUtils
export { saveOrderToSupabase, loadOrdersFromSupabase } from './supabaseUtils';
