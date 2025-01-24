import { Campaign, CampaignStatus } from "@/types/campaign";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCampaignMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCampaign = useMutation({
    mutationFn: async (campaign: Omit<Campaign, 'id'>) => {
      const { error } = await supabase.from("campaigns").insert([{
        name: campaign.name,
        message: campaign.message,
        image_url: campaign.image_url,
        Status: campaign.Status || "Pausado",
        client_id: campaign.client_id,
        mailing_id: campaign.mailing_id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Campanha criada com sucesso!" });
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
          client_id: campaign.client_id,
          mailing_id: campaign.mailing_id,
        })
        .eq("id", campaign.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Campanha atualizada com sucesso!" });
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

  return {
    createCampaign,
    updateCampaign,
    updateCampaignStatus,
    deleteCampaign,
  };
};