import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";

export const ContactSection = () => {
  return (
    <section className="section bg-surface" id="contact">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold">PEÇA SEU ORÇAMENTO</h2>
            <form className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Nome"
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <textarea
                  placeholder="Mensagem"
                  rows={4}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Enviar
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold">CONTATO</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Phone className="w-6 h-6 text-primary" />
                <span>(11) 1234-5678</span>
              </div>
              <div className="flex items-center space-x-4">
                <Mail className="w-6 h-6 text-primary" />
                <span>contato@oni.com.br</span>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="w-6 h-6 text-primary" />
                <span>São Paulo, SP</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};