import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  label?: string;
}

export const ImageUpload = ({ onImageUploaded, label = "Image" }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('website-images')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('website-images')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Error uploading image", {
        description: error.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={isUploading}
      />
      {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
    </div>
  );
};