
import { ApprovedOrder } from '../types';

/**
 * Loads approved orders from localStorage
 */
export const loadFromLocalStorage = (selectedYear: number, selectedMonth: number): ApprovedOrder[] => {
  const savedOrders = localStorage.getItem('approvedOrders');
  
  if (!savedOrders) {
    return [];
  }
  
  // Convert string dates back to Date objects
  const allOrders = JSON.parse(savedOrders, (key, value) => {
    if (key === 'approvedAt') return new Date(value);
    return value;
  }) as ApprovedOrder[];
  
  // Filter by selected month and year
  return allOrders.filter(order => {
    const approvalDate = new Date(order.approvedAt);
    return approvalDate.getFullYear() === selectedYear && 
            approvalDate.getMonth() + 1 === selectedMonth;
  });
};

/**
 * Saves approved orders to localStorage
 */
export const saveToLocalStorage = (orders: ApprovedOrder[]): void => {
  localStorage.setItem('approvedOrders', JSON.stringify(orders));
};
