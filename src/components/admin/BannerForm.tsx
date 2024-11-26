import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type BannerFormData = {
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  is_active: boolean;
};

export const BannerForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<BannerFormData>();

  const onSubmit = async (data: BannerFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.from("banners").insert(data);
      
      if (error) throw error;
      
      toast.success("Banner created successfully!");
      reset();
    } catch (error) {
      toast.error("Error creating banner", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" {...register("image_url")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video_url">Video URL</Label>
        <Input id="video_url" {...register("video_url")} />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="is_active" {...register("is_active")} />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Banner"}
      </Button>
    </form>
  );
};