
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Banner } from "@/types/banner";

interface UseBannerMutationsProps {
  onSuccess?: () => void;
}

export const useBannerMutations = ({ onSuccess }: UseBannerMutationsProps = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBanner = useMutation({
    mutationFn: async (formData: FormData) => {
      const file = formData.get("image") as File;
      let imageUrl = "";

      if (file.size > 0) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("oni-media")
          .upload(`banners/${Date.now()}-${file.name}`, file);
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }
        imageUrl = uploadData.path;
      }

      const duration = Number(formData.get("duration")) * 1000; // Convert seconds to milliseconds
      const pageLocation = formData.get("page_location") as string || 'index';

      const bannerData = {
        title: String(formData.get("title")),
        description: String(formData.get("description")),
        button_text: String(formData.get("button_text")),
        button_link: String(formData.get("button_link")),
        youtube_url: formData.get("youtube_url") ? String(formData.get("youtube_url")) : null,
        image_url: imageUrl,
        duration: duration,
        page_location: pageLocation,
      };

      const { error } = await supabase.from("banners").insert([bannerData]);
      if (error) {
        console.error("Error creating banner:", error);
        throw new Error(`Erro ao criar banner: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["active-banners"] });
      onSuccess?.();
      toast({ title: "Banner criado com sucesso!" });
    },
    onError: (error: Error) => {
      console.error("Error in createBanner mutation:", error);
      toast({
        title: "Erro ao criar banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBanner = useMutation({
    mutationFn: async ({ formData, bannerId }: { formData: FormData; bannerId: string }) => {
      const updatedData: any = {
        title: String(formData.get("title")),
        description: String(formData.get("description")),
        button_text: String(formData.get("button_text")),
        button_link: String(formData.get("button_link")),
        youtube_url: formData.get("youtube_url") ? String(formData.get("youtube_url")) : null,
        duration: Number(formData.get("duration")) * 1000, // Convert seconds to milliseconds
        page_location: formData.get("page_location") as string || 'index',
      };

      const file = formData.get("image") as File;
      if (file?.size > 0) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("oni-media")
          .upload(`banners/${Date.now()}-${file.name}`, file);
        
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        updatedData.image_url = uploadData.path;
      }

      const { error } = await supabase
        .from("banners")
        .update(updatedData)
        .eq("id", bannerId);

      if (error) {
        console.error("Error updating banner:", error);
        throw new Error(`Erro ao atualizar banner: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["active-banners"] });
      onSuccess?.();
      toast({ title: "Banner atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      console.error("Error in updateBanner mutation:", error);
      toast({
        title: "Erro ao atualizar banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["active-banners"] });
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
      queryClient.invalidateQueries({ queryKey: ["active-banners"] });
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

  const handleSubmit = async (formData: FormData, editingBanner: Banner | null) => {
    if (editingBanner) {
      await updateBanner.mutate({ formData, bannerId: editingBanner.id });
    } else {
      await createBanner.mutate(formData);
    }
  };

  return {
    handleSubmit,
    toggleBanner,
    deleteBanner,
    isSubmitting: createBanner.isPending || updateBanner.isPending,
  };
};
