
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditorialLine, Product, Status } from "@/pages/admin/sub-themes/types";

export function useEditorialLines() {
  return useQuery({
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
}

export function useProducts() {
  return useQuery({
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
}

export function useStatuses() {
  return useQuery({
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
}
