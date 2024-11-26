import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "./ImageUpload";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";

type BannerFormData = {
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  button_text?: string;
  button_url?: string;
  is_active: boolean;
};

export const BannerForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const { register, handleSubmit, reset, setValue } = useForm<BannerFormData>();

  const fetchBanners = async () => {
    const { data, error } = await supabase.from("banners").select("*");
    if (error) {
      toast.error("Error fetching banners");
    } else {
      setBanners(data);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const onSubmit = async (data: BannerFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.from("banners").insert(data);
      
      if (error) throw error;
      
      toast.success("Banner created successfully!");
      reset();
      fetchBanners();
    } catch (error) {
      toast.error("Error creating banner", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Banner status updated");
      fetchBanners();
    } catch (error) {
      toast.error("Error updating banner status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      
      if (error) throw error;
      
      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (error) {
      toast.error("Error deleting banner");
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} />
        </div>

        <div className="space-y-2">
          <Label>Image</Label>
          <ImageUpload onImageUploaded={(url) => setValue("image_url", url)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video_url">Video URL</Label>
          <Input id="video_url" {...register("video_url")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="button_text">Button Text</Label>
          <Input id="button_text" {...register("button_text")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="button_url">Button URL</Label>
          <Input id="button_url" {...register("button_url")} />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="is_active" {...register("is_active")} />
          <Label htmlFor="is_active">Active</Label>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Banner"}
        </Button>
      </form>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Existing Banners</h3>
        <div className="grid gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div>
                <h4 className="font-medium">{banner.title}</h4>
                <p className="text-sm text-gray-500">{banner.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(banner.id, banner.is_active)}
                >
                  {banner.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(banner.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};