
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { getStorageUrl } from "@/utils/imageUtils";
import React from "react";

export const Clients = () => {
  const { data: clients, isLoading } = useQuery({
    queryKey: ["active-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <section className="section bg-white" id="clients">
      <div className="container-custom">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16"
        >
          CLIENTES
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {clients?.map((client, index) => {
            // Make sure we're getting the full URL for the logo
            const imageUrl = client.logo_url.startsWith('http') 
              ? client.logo_url 
              : getStorageUrl(client.logo_url);

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center justify-center bg-surface rounded-lg hover:bg-surface-hover transition-colors aspect-[4/3]"
              >
                {client.website_url ? (
                  <a
                    href={client.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full flex items-center justify-center p-4"
                  >
                    <img
                      src={imageUrl}
                      alt={client.name}
                      className="w-full h-full grayscale hover:grayscale-0 transition-all object-contain"
                      loading="lazy"
                      decoding="async"
                      width="200"
                      height="150"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/placeholder.svg';
                      }}
                    />
                  </a>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={imageUrl}
                      alt={client.name}
                      className="w-full h-full grayscale hover:grayscale-0 transition-all object-contain"
                      loading="lazy"
                      decoding="async"
                      width="200"
                      height="150"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Clients;
