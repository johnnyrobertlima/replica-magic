import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Campaign } from "@/types/campaign";
import { Database } from "@/integrations/supabase/types";

type ClientesWhats = Database["public"]["Tables"]["Clientes_Whats"]["Row"];

interface CampaignFormProps {
  campaignName: string;
  setCampaignName: (value: string) => void;
  selectedClient: string;
  setSelectedClient: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  editingCampaign: Campaign | null;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  resetForm: () => void;
  clients: ClientesWhats[];
}

export function CampaignForm({
  campaignName,
  setCampaignName,
  selectedClient,
  setSelectedClient,
  message,
  setMessage,
  imageUrl,
  setImageUrl,
  editingCampaign,
  onSubmit,
  isSubmitting,
  resetForm,
  clients,
}: CampaignFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id || ""}>
                {client.nome}
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

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {editingCampaign ? "Atualizar" : "Criar"} Campanha
        </Button>
        {editingCampaign && (
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancelar Edição
          </Button>
        )}
      </div>
    </form>
  );
}