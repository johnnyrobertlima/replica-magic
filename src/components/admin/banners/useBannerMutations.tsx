
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Banner } from "@/types/banner";
import { useState } from "react";

export function useBannerMutations() {
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
        const { data: { publicUrl } } = supabase.storage
          .from("oni-media")
          .getPublicUrl(uploadData.path);
        imageUrl = publicUrl;
      }

      const duration = Number(formData.get("duration")) * 1000; // Convert seconds to milliseconds

      const bannerData = {
        title: String(formData.get("title")),
        description: String(formData.get("description")),
        button_text: String(formData.get("button_text")),
        button_link: String(formData.get("button_link")),
        youtube_url: formData.get("youtube_url") ? String(formData.get("youtube_url")) : null,
        image_url: imageUrl,
        duration: duration,
      };

      const { error } = await supabase.from("banners").insert([bannerData]);
      if (error) {
        console.error("Error creating banner:", error);
        throw new Error(`Erro ao criar banner: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
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

  const updateBanner = async (editingBanner: Banner, formData: FormData) => {
    try {
      const updatedData: any = {
        title: String(formData.get("title")),
        description: String(formData.get("description")),
        button_text: String(formData.get("button_text")),
        button_link: String(formData.get("button_link")),
        youtube_url: formData.get("youtube_url") ? String(formData.get("youtube_url")) : null,
        duration: Number(formData.get("duration")) * 1000, // Convert seconds to milliseconds
      };

      const file = formData.get("image") as File;
      if (file?.size > 0) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("oni-media")
          .upload(`banners/${Date.now()}-${file.name}`, file);
        
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            title: "Erro ao fazer upload da imagem",
            description: uploadError.message,
            variant: "destructive",
          });
          return false;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("oni-media")
          .getPublicUrl(uploadData.path);
        updatedData.image_url = publicUrl;
      }

      const { error } = await supabase
        .from("banners")
        .update(updatedData)
        .eq("id", editingBanner.id);

      if (error) {
        console.error("Error updating banner:", error);
        toast({
          title: "Erro ao atualizar banner",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner atualizado com sucesso!" });
      return true;
    } catch (error) {
      console.error("Error updating banner:", error);
      toast({
        title: "Erro ao atualizar banner",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

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
    createBanner,
    updateBanner,
    toggleBanner,
    deleteBanner
  };
}
