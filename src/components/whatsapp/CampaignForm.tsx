import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/ui/use-toast";
import { Campaign } from "@/types/campaign";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Image } from "lucide-react";

interface CampaignFormProps {
  campaignName: string;
  setCampaignName: (name: string) => void;
  selectedClient: string;
  setSelectedClient: (client: string) => void;
  message: string;
  setMessage: (message: string) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  editingCampaign: Campaign | null;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  resetForm: () => void;
}

export const CampaignForm = ({
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
}: CampaignFormProps) => {
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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Image className="h-4 w-4" />
          Imagem da Campanha (Opcional)
        </label>
        <ImageUpload
          name="campaign-image"
          bucket="campaign-images"
          onUrlChange={setImageUrl}
          currentImage={imageUrl}
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {editingCampaign
            ? isSubmitting
              ? "Atualizando..."
              : "Atualizar Campanha"
            : isSubmitting
            ? "Criando..."
            : "Inserir Campanha"}
        </Button>
        {editingCampaign && (
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};