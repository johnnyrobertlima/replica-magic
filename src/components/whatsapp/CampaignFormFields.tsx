import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ClientesWhats = Database["public"]["Tables"]["Clientes_Whats"]["Row"];

interface CampaignFormFieldsProps {
  campaignName: string;
  setCampaignName: (value: string) => void;
  selectedClient: string;
  setSelectedClient: (value: string) => void;
  selectedMailing: string;
  setSelectedMailing: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  clients: ClientesWhats[];
}

export function CampaignFormFields({
  campaignName,
  setCampaignName,
  selectedClient,
  setSelectedClient,
  selectedMailing,
  setSelectedMailing,
  message,
  setMessage,
  imageUrl,
  setImageUrl,
  clients,
}: CampaignFormFieldsProps) {
  const { data: mailings } = useQuery({
    queryKey: ['mailings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mailing')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <>
      <div>
        <Label htmlFor="name">Nome da Campanha</Label>
        <Input
          id="name"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="Digite o nome da campanha"
        />
      </div>

      <div>
        <Label htmlFor="client">Cliente</Label>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="mailing">Mailing</Label>
        <Select value={selectedMailing} onValueChange={setSelectedMailing}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Selecione um mailing" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {mailings?.map((mailing) => (
              <SelectItem key={mailing.id} value={mailing.id}>
                {mailing.nome_mailing}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="message">Mensagem</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite a mensagem da campanha"
          className="h-32"
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Cole a URL da imagem"
        />
      </div>
    </>
  );
}