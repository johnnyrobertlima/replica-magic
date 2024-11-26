import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import YouTube from "react-youtube";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  button_text: string | null;
  button_url: string | null;
}

export const Hero = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true);
      
      if (data && data.length > 0) {
        setBanners(data);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((current) => 
          current === banners.length - 1 ? 0 : current + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  if (!banners.length) return null;

  const currentBanner = banners[currentBannerIndex];
  const isVideo = currentBanner.video_url && currentBanner.video_url.includes("youtube");

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/);
    return match?.[1] || "";
  };

  return (
    <section className="relative h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full"
        >
          {isVideo ? (
            <div className="absolute inset-0">
              <YouTube
                videoId={getYoutubeId(currentBanner.video_url!)}
                opts={{
                  height: "100%",
                  width: "100%",
                  playerVars: {
                    autoplay: 1,
                    controls: 0,
                    rel: 0,
                    showinfo: 0,
                    mute: 1,
                    loop: 1,
                    modestbranding: 1,
                  },
                }}
                className="w-full h-full"
                onEnd={(e) => e.target.playVideo()}
              />
            </div>
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${currentBanner.image_url})`,
              }}
            />
          )}

          <div className="absolute inset-0 bg-black/50" />

          <div className="relative h-full flex items-center justify-center text-center">
            <div className="max-w-4xl px-4 space-y-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-white leading-tight"
              >
                {currentBanner.title}
              </motion.h1>
              {currentBanner.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/90 leading-relaxed"
                >
                  {currentBanner.description}
                </motion.p>
              )}
              {currentBanner.button_text && currentBanner.button_url && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    size="lg"
                    onClick={() => window.open(currentBanner.button_url!, '_blank')}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
                  >
                    {currentBanner.button_text}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentBannerIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};