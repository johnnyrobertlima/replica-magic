import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {clients?.map((client, index) => {
            const imageUrl = client.logo_url ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/oni-media/${client.logo_url}` : '';

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center justify-center p-6 bg-surface rounded-lg hover:bg-surface-hover transition-colors"
              >
                <img
                  src={imageUrl}
                  alt={client.name}
                  className="max-h-12 w-auto grayscale hover:grayscale-0 transition-all object-contain"
                  loading="lazy"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};