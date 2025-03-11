
import { useState } from "react";
import { BannerForm } from "@/pages/admin/banners/BannerForm";
import { useBannerMutations } from "./useBannerMutations";
import { Banner } from "@/types/banner";

interface BannerFormWrapperProps {
  editingBanner: Banner | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BannerFormWrapper({ 
  editingBanner, 
  onSuccess, 
  onCancel 
}: BannerFormWrapperProps) {
  const { createBanner, updateBanner } = useBannerMutations();

  const handleSubmit = async (formData: FormData) => {
    let success = false;
    
    if (editingBanner) {
      success = await updateBanner(editingBanner, formData);
    } else {
      createBanner.mutate(formData, {
        onSuccess: () => {
          success = true;
          onSuccess();
        }
      });
      return; // Return early as createBanner uses the mutation pattern
    }
    
    if (success) {
      onSuccess();
    }
  };

  return (
    <BannerForm
      onSubmit={handleSubmit}
      editingBanner={editingBanner}
      isSubmitting={createBanner.isPending}
      onCancel={onCancel}
    />
  );
}
