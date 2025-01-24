import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const WhatsAppService = () => {
  const [campaignName, setCampaignName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campaigns").insert([
        {
          name: campaignName,
          client_id: selectedClient,
          message: message,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Campanha criada com sucesso!" });
      setCampaignName("");
      setSelectedClient("");
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !selectedClient || !message) {
      toast({
        title: "Erro ao criar campanha",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createCampaign.mutate();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Disparo de WhatsApp</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Configure sua campanha de WhatsApp preenchendo os campos abaixo.
        </p>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="campaign-name" className="text-sm font-medium">
                    Nome da Campanha
                  </label>
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Digite o nome da campanha"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="client" className="text-sm font-medium">
                    Cliente
                  </label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Mensagem da Campanha
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite a mensagem da campanha"
                  className="min-h-[200px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createCampaign.isPending}
              >
                {createCampaign.isPending ? "Criando..." : "Inserir Campanha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default WhatsAppService;