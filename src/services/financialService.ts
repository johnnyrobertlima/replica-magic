
import { supabase } from "@/integrations/supabase/client";
import { ClienteFinanceiro } from "@/types/financialClient";
import { calculateClientFinancialValues, fetchTitulosVencidos } from "@/utils/financialUtils";

// Fetch financial titles for clients
export const fetchFinancialTitles = async (clientesCodigos: number[]) => {
  const { data: titulos, error } = await supabase
    .from('BLUEBAY_TITULO')
    .select('*')
    .in('PES_CODIGO', clientesCodigos.map(String))
    .in('STATUS', ['1', '2', '3']);

  if (error) throw error;
  return titulos;
};

// Split the longer file into modular functions
export * from './financial/clientDataService';
export * from './financial/financialProcessor';
export * from './financial/valorService';
