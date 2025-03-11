
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Banner } from "@/types/banner";

export function useBannerActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleBanner = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !is_active })
        .eq("id", id);
      if (error) {
        console.error("Error toggling banner:", error);
        throw new Error(`Erro ao atualizar banner: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      console.error("Error in toggleBanner mutation:", error);
      toast({
        title: "Erro ao atualizar banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error deleting banner:", error);
        throw new Error(`Erro ao excluir banner: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner excluído com sucesso!" });
    },
    onError: (error: Error) => {
      console.error("Error in deleteBanner mutation:", error);
      toast({
        title: "Erro ao excluir banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    toggleBanner,
    deleteBanner
  };
}
