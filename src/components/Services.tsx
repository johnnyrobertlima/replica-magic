import { Monitor, Globe, Users, Video, Share2, BarChart } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: <Monitor className="w-8 h-8" />,
    title: "Planejamento Digital",
    description: "Estratégias personalizadas para sua presença online"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Web Development",
    description: "Desenvolvimento de sites e aplicações web modernas"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Assessoria De Imprensa",
    description: "Gestão completa da sua comunicação"
  },
  {
    icon: <Video className="w-8 h-8" />,
    title: "Web Video",
    description: "Produção de conteúdo audiovisual"
  },
  {
    icon: <Share2 className="w-8 h-8" />,
    title: "Social Network",
    description: "Gestão de redes sociais e engajamento"
  },
  {
    icon: <BarChart className="w-8 h-8" />,
    title: "Social Compliance",
    description: "Monitoramento e análise de resultados"
  }
];

export const Services = () => {
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
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-primary mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};