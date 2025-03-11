
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Banner } from "@/types/banner";

export const useBanners = () => {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async (): Promise<Banner[]> => {
      const { data, error } = await supabase
        .from("banners")
        .select("id, title, description, image_url, button_text, button_link, youtube_url, is_active, created_at, updated_at, duration");

      if (error) {
        throw new Error(`Error fetching banners: ${error.message}`);
      }

      return data || [];
    },
  });
};
