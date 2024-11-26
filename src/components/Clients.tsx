import { motion } from "framer-motion";

const clients = [
  { name: "Shoppinho Santo André", logo: "/placeholder.svg" },
  { name: "Luiz Construtor", logo: "/placeholder.svg" },
  { name: "Galeria Page Brás", logo: "/placeholder.svg" },
  { name: "Studio Ark", logo: "/placeholder.svg" },
  { name: "Casa das Crianças", logo: "/placeholder.svg" },
  { name: "Lojão do Brás", logo: "/placeholder.svg" },
  { name: "Feirinha da Concórdia", logo: "/placeholder.svg" },
  { name: "Crawling", logo: "/placeholder.svg" },
];

export const Clients = () => {
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
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center justify-center p-6 bg-surface rounded-lg hover:bg-surface-hover transition-colors"
            >
              <img
                src={client.logo}
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