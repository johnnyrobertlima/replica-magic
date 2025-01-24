import { WhatsAppClientForm } from "@/components/admin/clients/WhatsAppClientForm";

const WhatsAppClients = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cadastro de Clientes WhatsApp</h1>
      <div className="max-w-2xl mx-auto">
        <WhatsAppClientForm />
      </div>
    </main>
  );
};

export default WhatsAppClients;