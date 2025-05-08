
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditorialLine, Product, Status } from "@/pages/admin/sub-themes/types";

export function useOniAgenciaThemes() {
  // Query for editorial lines
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

  // Query for products
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

  // Query for statuses
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
    data: editorialLinesQuery.data || [],
    isLoading: editorialLinesQuery.isLoading,
    isError: editorialLinesQuery.isError,
    error: editorialLinesQuery.error,
    data: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    data: statusesQuery.data || [],
    isLoading: statusesQuery.isLoading,
    isError: statusesQuery.isError,
    error: statusesQuery.error,
  };
}
