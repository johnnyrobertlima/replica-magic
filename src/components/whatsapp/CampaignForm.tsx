import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { Database } from "@/integrations/supabase/types";
import { CampaignFormFields } from "./CampaignFormFields";

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
      <CampaignFormFields
        campaignName={campaignName}
        setCampaignName={setCampaignName}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        message={message}
        setMessage={setMessage}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        clients={clients}
      />

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