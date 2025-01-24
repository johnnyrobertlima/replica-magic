import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const WhatsAppService = () => {
  const benefits = [
    "Envio em massa de mensagens personalizadas",
    "Segmentação de público-alvo",
    "Relatórios detalhados de entrega",
    "Automação de campanhas",
    "Suporte técnico especializado",
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Disparo de WhatsApp</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Potencialize sua comunicação com clientes através de nossa solução profissional de disparo de WhatsApp.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Benefícios do Serviço</CardTitle>
            <CardDescription>
              Conheça as vantagens de utilizar nossa plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button size="lg" className="px-8">
            Contratar Agora
          </Button>
        </div>
      </div>
    </main>
  );
};

export default WhatsAppService;