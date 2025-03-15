
import { supabase } from "@/integrations/supabase/client";
import { ApprovedOrder } from "../types";

// Save an approved order to Supabase
export const saveOrderToSupabase = async (order: ApprovedOrder): Promise<void> => {
  try {
    const { error } = await supabase
      .from('approved_orders')
      .insert({
        separacao_id: order.separacao_id,
        cliente_data: order.cliente_data,
        user_email: order.user_email,
        user_id: order.user_id,
        action: order.action
      });
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    console.log('Successfully saved order to Supabase');
  } catch (error) {
    console.error('Error saving order to Supabase:', error);
    throw error;
  }
};

// Load approved orders from Supabase
export const loadOrdersFromSupabase = async (
  year: number,
  month: number
): Promise<ApprovedOrder[]> => {
  try {
    // Calculate date range for the specified month
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
    
    console.log(`Loading orders from Supabase between ${startDate} and ${endDate}`);
    
    const { data, error } = await supabase
      .from('approved_orders')
      .select('*')
      .gte('approved_at', startDate)
      .lte('approved_at', endDate)
      .order('approved_at', { ascending: false });
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log('No orders found in Supabase for the specified period');
      return [];
    }
    
    // Map database records to ApprovedOrder objects
    const orders: ApprovedOrder[] = data.map(record => ({
      id: record.id,
      separacao_id: record.separacao_id,
      cliente_data: record.cliente_data,
      approved_at: record.approved_at,
      user_id: record.user_id,
      user_email: record.user_email,
      action: record.action
    }));
    
    console.log(`Loaded ${orders.length} orders from Supabase`);
    return orders;
  } catch (error) {
    console.error('Error loading orders from Supabase:', error);
    return [];
  }
};
