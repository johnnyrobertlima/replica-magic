import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { CampaignForm } from "@/components/whatsapp/CampaignForm";
import { CampaignTable } from "@/components/whatsapp/CampaignTable";
import { Campaign, CampaignStatus } from "@/types/campaign";

const WhatsAppService = () => {
  const [campaignName, setCampaignName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campaigns").insert([
        {
          name: campaignName,
          message: message,
          image_url: imageUrl,
          Status: "Pausado" as CampaignStatus,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Campanha criada com sucesso!" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async (campaign: Campaign) => {
      const { error } = await supabase
        .from("campaigns")
        .update({
          name: campaign.name,
          message: campaign.message,
          image_url: campaign.image_url,
        })
        .eq("id", campaign.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Campanha atualizada com sucesso!" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar campanha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCampaignStatus = useMutation({
    mutationFn: async ({ id, Status }: { id: string; Status: CampaignStatus }) => {
      const { error } = await supabase
        .from("campaigns")
        .update({ Status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Status atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Campanha excluída com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir campanha",
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
        description: "Nome da campanha, cliente e mensagem são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (editingCampaign) {
      updateCampaign.mutate({
        ...editingCampaign,
        name: campaignName,
        message: message,
        image_url: imageUrl,
      });
    } else {
      createCampaign.mutate();
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignName(campaign.name);
    setMessage(campaign.message);
    setImageUrl(campaign.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setCampaignName("");
    setSelectedClient("");
    setMessage("");
    setImageUrl("");
    setEditingCampaign(null);
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

        <Card className="mb-8">
          <CardContent className="pt-6">
            <CampaignForm
              campaignName={campaignName}
              setCampaignName={setCampaignName}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              message={message}
              setMessage={setMessage}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              editingCampaign={editingCampaign}
              onSubmit={handleSubmit}
              isSubmitting={createCampaign.isPending || updateCampaign.isPending}
              resetForm={resetForm}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Campanhas Cadastradas</h2>
            {campaigns && (
              <CampaignTable
                campaigns={campaigns}
                onStatusChange={(id, Status) => updateCampaignStatus.mutate({ id, Status })}
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