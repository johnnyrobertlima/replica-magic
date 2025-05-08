
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditorialLine, Product, Status } from "@/pages/admin/sub-themes/types";

// Main hook function that combines all theme-related queries
export function useOniAgenciaThemes() {
  const editorialLinesQuery = useQuery({
    queryKey: ['oniAgenciaEditorialLines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("editorial_lines")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as EditorialLine[];
    },
  });

  const productsQuery = useQuery({
    queryKey: ['oniAgenciaProducts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const statusesQuery = useQuery({
    queryKey: ['oniAgenciaStatuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oni_agencia_status")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Status[];
    },
  });

  return {
    // Editorial lines data
    editorialLines: editorialLinesQuery.data || [],
    isLoadingEditorialLines: editorialLinesQuery.isLoading,
    isErrorEditorialLines: editorialLinesQuery.isError,
    errorEditorialLines: editorialLinesQuery.error,
    
    // Products data
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    isErrorProducts: productsQuery.isError,
    errorProducts: productsQuery.error,
    
    // Statuses data
    statuses: statusesQuery.data || [],
    isLoadingStatuses: statusesQuery.isLoading,
    isErrorStatuses: statusesQuery.isError,
    errorStatuses: statusesQuery.error,
  };
}

// Individual hook functions for consumers that need focused data
export function useEditorialLines() {
  const { editorialLines, isLoadingEditorialLines, isErrorEditorialLines, errorEditorialLines } = useOniAgenciaThemes();
  return {
    data: editorialLines,
    isLoading: isLoadingEditorialLines,
    isError: isErrorEditorialLines,
    error: errorEditorialLines
  };
}

export function useProducts() {
  const { products, isLoadingProducts, isErrorProducts, errorProducts } = useOniAgenciaThemes();
  return {
    data: products,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    error: errorProducts
  };
}

export function useStatuses() {
  const { statuses, isLoadingStatuses, isErrorStatuses, errorStatuses } = useOniAgenciaThemes();
  return {
    data: statuses,
    isLoading: isLoadingStatuses,
    isError: isErrorStatuses,
    error: errorStatuses
  };
}
