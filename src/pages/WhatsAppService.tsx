import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { CampaignForm } from "@/components/whatsapp/CampaignForm";
import { CampaignTable } from "@/components/whatsapp/CampaignTable";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { CampaignHeader } from "@/components/whatsapp/CampaignHeader";
import { useCampaigns } from "@/components/whatsapp/useCampaigns";
import { useCampaignMutations } from "@/components/whatsapp/useCampaignMutations";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const WhatsAppService = () => {
  const [campaignName, setCampaignName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedMailing, setSelectedMailing] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const { toast } = useToast();

  const { data: campaigns } = useCampaigns();
  const { createCampaign, updateCampaign, updateCampaignStatus, deleteCampaign } = useCampaignMutations();

  const { data: clients } = useQuery({
    queryKey: ["whatsapp-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Clientes_Whats")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setCampaignName("");
    setSelectedClient("");
    setSelectedMailing("");
    setMessage("");
    setImageUrl("");
    setEditingCampaign(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !selectedClient || !selectedMailing || !message) {
      toast({
        title: "Erro ao criar campanha",
        description: "Nome da campanha, cliente, mailing e mensagem são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (editingCampaign) {
      await updateCampaign.mutateAsync({
        ...editingCampaign,
        name: campaignName,
        message: message,
        image_url: imageUrl,
        client_id: selectedClient,
        mailing_id: selectedMailing,
      });
    } else {
      await createCampaign.mutateAsync({
        name: campaignName,
        message: message,
        image_url: imageUrl,
        Status: "Pausado" as CampaignStatus,
        client_id: selectedClient,
        mailing_id: selectedMailing,
      });
    }
    
    resetForm();
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignName(campaign.name);
    setMessage(campaign.message);
    setImageUrl(campaign.image_url || "");
    setSelectedClient(campaign.client_id || "");
    setSelectedMailing(campaign.mailing_id || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <CampaignHeader />

      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <CampaignForm
              campaignName={campaignName}
              setCampaignName={setCampaignName}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              selectedMailing={selectedMailing}
              setSelectedMailing={setSelectedMailing}
              message={message}
              setMessage={setMessage}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              editingCampaign={editingCampaign}
              onSubmit={handleSubmit}
              isSubmitting={createCampaign.isPending || updateCampaign.isPending}
              resetForm={resetForm}
              clients={clients || []}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Campanhas Cadastradas</h2>
            {campaigns && (
              <CampaignTable
                campaigns={campaigns}
                onStatusChange={(id, status) => updateCampaignStatus.mutate({ id, Status: status as CampaignStatus })}
                onEdit={handleEdit}
                onDelete={(id) => deleteCampaign.mutate(id)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default WhatsAppService;