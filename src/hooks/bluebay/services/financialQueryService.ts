
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "../types/financialTypes";

/**
 * Busca títulos financeiros do Supabase com filtros aplicados
 */
export const fetchTitulos = async (
  dateRange: DateRange,
  currentPage: number,
  pageSize: number
) => {
  try {
    // Format dates for database filtering
    const startDateFormatted = dateRange.startDate 
      ? format(dateRange.startDate, 'yyyy-MM-dd') 
      : null;
    
    const endDateFormatted = dateRange.endDate
      ? format(dateRange.endDate, 'yyyy-MM-dd')
      : null;
    
    console.log(`Filtrando títulos por período: ${startDateFormatted} até ${endDateFormatted}`);
    
    // Prepare the query for BLUEBAY_TITULO with proper date filtering
    let tituloQuery = supabase
      .from('BLUEBAY_TITULO')
      .select('*', { count: 'exact' });
    
    // Apply date filters if both dates are provided
    if (startDateFormatted && endDateFormatted) {
      tituloQuery = tituloQuery
        .gte('DTVENCIMENTO', startDateFormatted)
        .lte('DTVENCIMENTO', endDateFormatted);
    }
    
    // Add pagination with proper range calculation
    tituloQuery = tituloQuery
      .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
    
    // Execute query
    const { data: allTitulos, error: allTitulosError, count } = await tituloQuery;
    
    if (allTitulosError) {
      console.error("Erro ao buscar títulos:", allTitulosError);
      throw allTitulosError;
    }
    
    console.info(`Buscados ${allTitulos?.length || 0} títulos (página ${currentPage}, de ${(currentPage - 1) * pageSize + 1} até ${Math.min(currentPage * pageSize, count || 0)})`);
    console.info(`Total de registros: ${count}`);
    
    return { data: allTitulos || [], count: count || 0 };
  } catch (error) {
    console.error("Erro ao buscar títulos:", error);
    throw error;
  }
};

/**
 * Busca títulos com valores nulos na data de vencimento
 */
export const fetchTitulosComDataNula = async () => {
  try {
    const { data, error } = await supabase
      .from('BLUEBAY_TITULO')
      .select('*')
      .is('DTVENCIMENTO', null);
    
    if (error) {
      console.error("Erro ao buscar títulos com data nula:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar títulos com data nula:", error);
    return [];
  }
};

/**
 * Busca dados de faturamento para BLUEBAY
 */
export const fetchFaturamento = async (dateRange: DateRange) => {
  try {
    // Format dates for database filtering
    const startDateFormatted = dateRange.startDate 
      ? format(dateRange.startDate, 'yyyy-MM-dd') 
      : null;
    
    const endDateFormatted = dateRange.endDate
      ? format(dateRange.endDate, 'yyyy-MM-dd')
      : null;
    
    console.log(`Filtrando faturamento por período: ${startDateFormatted} até ${endDateFormatted}`);
    
    let faturamentoQuery = supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*');
    
    // Apply date filters to faturamento if needed
    if (startDateFormatted && endDateFormatted) {
      faturamentoQuery = faturamentoQuery
        .gte('DATA_EMISSAO', startDateFormatted)
        .lte('DATA_EMISSAO', endDateFormatted);
    }
    
    const { data, error } = await faturamentoQuery;
    
    if (error) {
      console.error("Erro ao buscar faturamento:", error);
      throw error;
    }
    
    console.info(`Buscados ${data?.length || 0} registros de faturamento`);
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
    throw error;
  }
};
