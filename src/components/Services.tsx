import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { SiteOniTables } from "@/integrations/supabase/types";

type Service = SiteOniTables['services']['Row'];

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("site_oni.services")
        .select("*");
      if (data) {
        setServices(data);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="section bg-surface" id="services">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">BEM VINDO À ONI</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Oferecemos soluções digitais completas para sua empresa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = (Icons[service.icon as keyof typeof Icons] as LucideIcon) || Icons.HelpCircle;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-primary mb-4">
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
