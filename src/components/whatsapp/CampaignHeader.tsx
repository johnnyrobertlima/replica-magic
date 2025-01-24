import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const CampaignHeader = () => {
  return (
    <>
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Disparo de WhatsApp</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Configure sua campanha de WhatsApp preenchendo os campos abaixo.
        </p>
      </div>
    </>
  );
};