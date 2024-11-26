import { Monitor, Globe, Users, Video, Share2, BarChart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-8 h-8" />,
  Globe: <Globe className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
  Video: <Video className="w-8 h-8" />,
  Share2: <Share2 className="w-8 h-8" />,
  BarChart: <BarChart className="w-8 h-8" />,
};

export const Services = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ["active-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
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
          {services?.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-primary mb-4">
                {iconMap[service.icon]}
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};