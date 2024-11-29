import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { getStorageUrl } from "@/utils/imageUtils";
import { useEffect, useState } from "react";

export const Hero = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const { data: banners, isLoading } = useQuery({
    queryKey: ["active-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const currentBanner = banners[currentBannerIndex];
    const duration = currentBanner?.duration || 5000;

    const timer = setTimeout(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentBannerIndex, banners]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const banner = banners[currentBannerIndex];
  const imageUrl = getStorageUrl(banner.image_url);

  // Extract YouTube video ID from URL if present
  const getYouTubeVideoId = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(banner.youtube_url);

  return (
    <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {videoId ? (
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute w-full h-full object-cover"
              style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${imageUrl}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      
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