
import { useState } from "react";
import { Banner } from "@/types/banner";
import { BannerList } from "./banners/BannerList";
import { useBanners } from "@/components/admin/bluebay-banners/useBanners";
import { useBannerActions } from "@/components/admin/bluebay-banners/BannerActions";
import { BannerFormWrapper } from "@/components/admin/bluebay-banners/BannerFormWrapper";
import { BannersHeader } from "@/components/admin/bluebay-banners/BannersHeader";

export const BluebayBanners = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  const { data: banners, isLoading } = useBanners();
  const { toggleBanner, deleteBanner } = useBannerActions();

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsCreating(true);
  };

  const handleFormSuccess = () => {
    setIsCreating(false);
    setEditingBanner(null);
  };

  const handleFormCancel = () => {
    setIsCreating(false);
    setEditingBanner(null);
  };

  const handleCreateClick = () => {
    setEditingBanner(null);
    setIsCreating(!isCreating);
  };

  return (
    <div className="space-y-6">
      <BannersHeader onCreateClick={handleCreateClick} />

      {isCreating && (
        <BannerFormWrapper
          editingBanner={editingBanner}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <BannerList
        banners={banners}
        isLoading={isLoading}
        onEdit={handleEdit}
        onToggle={(id, is_active) => toggleBanner.mutate({ id, is_active })}
        onDelete={(id) => deleteBanner.mutate(id)}
      />
    </div>
  );
};

export default BluebayBanners;
