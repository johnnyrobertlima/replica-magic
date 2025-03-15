
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BannerForm } from "./BannerForm";
import { BannerList } from "./BannerList";
import { Banner } from "@/types/banner";
import { useBannerMutations } from "./hooks/useBannerMutations";
import { supabase } from "@/integrations/supabase/client";

export const AdminBannersPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  const { data: banners, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching banners:", error);
        throw error;
      }
      return data as Banner[];
    },
  });

  const { 
    handleSubmit, 
    toggleBanner, 
    deleteBanner, 
    isSubmitting 
  } = useBannerMutations({
    onSuccess: () => {
      setIsCreating(false);
      setEditingBanner(null);
    }
  });

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={() => {
          setEditingBanner(null);
          setIsCreating(!isCreating);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      {isCreating && (
        <BannerForm
          onSubmit={(formData) => handleSubmit(formData, editingBanner)}
          editingBanner={editingBanner}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setIsCreating(false);
            setEditingBanner(null);
          }}
        />
      )}

      <BannerList
        banners={banners}
        isLoading={isLoading}
        onEdit={handleEdit}
        onToggle={(id, is_active) => toggleBanner({ id, is_active })}
        onDelete={(id) => deleteBanner(id)}
      />
    </div>
  );
};
