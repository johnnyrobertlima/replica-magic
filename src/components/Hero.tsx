import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Hero = () => {
  const { data: banners, isLoading } = useQuery({
    queryKey: ["active-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const banner = banners?.[0];

  if (!banner) {
    return null;
  }

  // Construct the full URL for the banner image
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/oni-media/${banner.image_url}`;

  return (
    <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${imageUrl}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative container-custom h-full flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white max-w-3xl px-4"
        >
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            {banner.title}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-8">
            {banner.description}
          </p>
          <a href={banner.button_link} className="btn-primary">
            {banner.button_text}
          </a>
        </motion.div>
      </div>
    </div>
  );
};