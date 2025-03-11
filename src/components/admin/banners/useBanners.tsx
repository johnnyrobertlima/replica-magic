
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Banner } from "@/types/banner";

export function useBanners() {
  return useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("page", "home")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching banners:", error);
        throw error;
      }
      return data as Banner[];
    },
  });
}
