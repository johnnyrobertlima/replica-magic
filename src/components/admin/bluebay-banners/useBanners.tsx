
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Banner } from "@/types/banner";

export function useBanners() {
  return useQuery({
    queryKey: ["bluebay-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("id, title, description, button_text, button_link, image_url, youtube_url, is_active, duration")
        .eq("page", "bluebay-home")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching banners:", error);
        throw error;
      }
      return (data || []) as Banner[];
    },
  });
}
