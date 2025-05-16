
import { useQuery } from "@tanstack/react-query";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStorageUrl } from "@/utils/imageUtils";

const iconMap = {
  Facebook: Facebook,
  Twitter: Twitter,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
};

export const Footer = () => {
  const { data: socialMedia } = useQuery({
    queryKey: ["social-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: oniLogo } = useQuery({
    queryKey: ["oni-logo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logos")
        .select("*")
        .eq("type", "oni")
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Get the full URL for the logo
  const logoUrl = oniLogo?.url ? (
    oniLogo.url.startsWith('http') 
      ? oniLogo.url 
      : getStorageUrl(oniLogo.url)
  ) : "/placeholder.svg";

  console.log('ONI Logo URL:', logoUrl); // Debug log

  // Make sure Instagram is included in social media links
  const instagramUrl = "https://www.instagram.com/oniagencia";
  const hasInstagram = socialMedia?.some(social => 
    social.icon === "Instagram" && social.is_active
  );

  return (
    <footer className="bg-primary text-white py-12">
      <div className="container-custom">
        <div className="flex flex-col items-center space-y-6">
          <img
            src={logoUrl}
            alt="ONI Digital"
            className="h-60 w-auto object-contain"
            onError={(e) => {
              console.error('Logo load error:', e);
              const img = e.target as HTMLImageElement;
              img.src = '/placeholder.svg';
            }}
          />
          <div className="flex space-x-6">
            {socialMedia?.map((social) => {
              const Icon = iconMap[social.icon as keyof typeof iconMap];
              return Icon ? (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/80 transition-colors"
                >
                  <Icon className="w-6 h-6" />
                </a>
              ) : null;
            })}
            
            {/* Add Instagram link if not already in database */}
            {!hasInstagram && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80 transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
            )}
          </div>
          <div className="text-center space-y-2">
            <p className="text-white/80">
              © 2024 Oni Agência. Todos os direitos reservados.
            </p>
            <p className="text-sm text-white/80">
              CNPJ: 19.653.051/0001-40 - 11 Anos unindo Tecnologia e Marketing
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
