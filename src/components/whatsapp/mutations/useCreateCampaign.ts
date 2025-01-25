import { Campaign } from "@/types/campaign";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCreateCampaign = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
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
};