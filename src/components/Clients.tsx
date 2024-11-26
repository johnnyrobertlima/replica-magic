import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export const Clients = () => {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase
        .from("clients")
        .select("*");
      if (data) {
        setClients(data);
      }
    };

    fetchClients();
  }, []);

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
          {clients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center justify-center p-6 bg-surface rounded-lg hover:bg-surface-hover transition-colors"
            >
              <img
                src={client.logo_url}
                alt={client.name}
                className="max-h-12 w-auto grayscale hover:grayscale-0 transition-all"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};