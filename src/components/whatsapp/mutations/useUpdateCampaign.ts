import { Campaign } from "@/types/campaign";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
      toast({
        title: "Campanha atualizada com sucesso!"
      });
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
};