
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
    if (editingBanner) {
      const success = await updateBanner(editingBanner, formData);
      if (success) {
        onSuccess();
      }
    } else {
      createBanner.mutate(formData, {
        onSuccess: () => {
          onSuccess();
        }
      });
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
