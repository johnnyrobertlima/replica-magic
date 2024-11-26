import { useQuery } from "@tanstack/react-query";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <footer className="bg-primary text-white py-12">
      <div className="container-custom">
        <div className="flex flex-col items-center space-y-6">
          <img
            src="/placeholder.svg"
            alt="ONI Digital"
            className="h-12 w-auto"
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