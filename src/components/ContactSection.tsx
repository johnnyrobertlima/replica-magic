
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;

    try {
      // First, save to database
      const { error: dbError } = await supabase
        .from("contact_messages")
        .insert([{ name, email, phone, message }]);

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Erro ao salvar mensagem no banco de dados");
      }

      // Then, send email notification
      const { data, error: emailError } = await supabase.functions.invoke("send-contact-email", {
        body: { name, email, phone, message },
      });

      if (emailError) {
        console.error("Email sending error:", emailError);
        // Still show success if only the email failed but DB succeeded
        toast({
          title: "Mensagem enviada com sucesso!",
          description: "Sua mensagem foi salva, mas houve um problema ao enviar o email de notificação.",
          variant: "default",
        });
      } else {
        // Show success message in toast
        toast({
          title: "Mensagem enviada com sucesso!",
          description: "Entraremos em contato em breve.",
        });
        
        // Set form sent to true to show success message
        setFormSent(true);
      }

      // Reset form safely using the ref
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormSent(false);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

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
            
            {formSent ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <h3 className="text-xl font-semibold text-green-700">Mensagem enviada com sucesso!</h3>
                </div>
                <p className="text-green-600">
                  Obrigado por entrar em contato. Recebemos sua mensagem e entraremos em contato em breve.
                </p>
                <button 
                  onClick={resetForm}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mt-4"
                >
                  Enviar nova mensagem
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nome"
                    required
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telefone"
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    placeholder="Mensagem"
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </button>
              </form>
            )}
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
                <span>(11) 2692-9073</span>
              </div>
              <div className="flex items-center space-x-4">
                <Mail className="w-6 h-6 text-primary" />
                <span>comercial@oniagencia.com.br</span>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="w-6 h-6 text-primary" />
                <span>Av. Rangel Pestana 1988 - Conj. 12</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
