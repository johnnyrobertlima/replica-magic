
import { supabase } from "@/integrations/supabase/client";
import { ApprovedOrder } from "../types";

// Save an approved order to Supabase
export const saveOrderToSupabase = async (order: ApprovedOrder): Promise<void> => {
  try {
    console.log("Saving order to Supabase:", order);
    
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
      console.error(`Supabase error when saving order: ${error.message}`, error);
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
      console.error(`Supabase error when loading orders: ${error.message}`, error);
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log('No orders found in Supabase for the specified period');
      return [];
    }
    
    // For each order, check if the separacao has related items
    const enrichedOrders: ApprovedOrder[] = [];
    
    for (const record of data) {
      // If the record already has cliente_data with separacao_itens_flat, use it directly
      const hasDetailedItems = record.cliente_data?.separacoes?.some(
        sep => sep.id === record.separacao_id && sep.separacao_itens_flat?.length > 0
      );
      
      if (hasDetailedItems) {
        // Just map the record as is
        enrichedOrders.push({
          id: record.id,
          separacao_id: record.separacao_id,
          cliente_data: record.cliente_data,
          approved_at: record.approved_at,
          user_id: record.user_id,
          user_email: record.user_email,
          action: record.action
        });
      } else {
        // Try to fetch the separacao items separately
        try {
          const { data: separacaoData, error: separacaoError } = await supabase
            .from('separacoes')
            .select(`
              *,
              separacao_itens(*)
            `)
            .eq('id', record.separacao_id)
            .single();
            
          if (separacaoError) {
            console.warn(`Could not fetch separation items for ${record.separacao_id}: ${separacaoError.message}`);
            // Still add the record but without the detailed items
            enrichedOrders.push({
              id: record.id,
              separacao_id: record.separacao_id,
              cliente_data: record.cliente_data,
              approved_at: record.approved_at,
              user_id: record.user_id,
              user_email: record.user_email,
              action: record.action
            });
          } else {
            // Enrich the cliente_data with the fetched items
            const clienteData = { ...record.cliente_data };
            
            // If the cliente_data has separacoes array
            if (clienteData.separacoes) {
              clienteData.separacoes = clienteData.separacoes.map(sep => 
                sep.id === record.separacao_id
                  ? { ...sep, separacao_itens_flat: separacaoData.separacao_itens }
                  : sep
              );
            }
            
            enrichedOrders.push({
              id: record.id,
              separacao_id: record.separacao_id,
              cliente_data: clienteData,
              approved_at: record.approved_at,
              user_id: record.user_id,
              user_email: record.user_email,
              action: record.action
            });
          }
        } catch (err) {
          console.error(`Error enriching order ${record.id}:`, err);
          // Still add the record but without enrichment
          enrichedOrders.push({
            id: record.id,
            separacao_id: record.separacao_id,
            cliente_data: record.cliente_data,
            approved_at: record.approved_at,
            user_id: record.user_id,
            user_email: record.user_email,
            action: record.action
          });
        }
      }
    }
    
    console.log(`Loaded and enriched ${enrichedOrders.length} orders from Supabase`);
    return enrichedOrders;
  } catch (error) {
    console.error('Error loading orders from Supabase:', error);
    return [];
  }
};
