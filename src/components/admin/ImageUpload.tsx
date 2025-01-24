import { useState } from "react";
import { Input } from "@/components/ui/input";
import { validateImage } from "@/utils/imageUtils";
import { useToast } from "@/components/ui/use-toast";
import { getStorageUrl } from "@/utils/imageUtils";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  name: string;
  currentImage?: string;
  onChange?: (file: File | null) => void;
  onUrlChange?: (url: string) => void;
  accept?: string;
  bucket?: string;
}

export const ImageUpload = ({ 
  name, 
  currentImage, 
  onChange,
  onUrlChange,
  accept = "image/jpeg,image/png,image/webp",
  bucket = "oni-media"
}: ImageUploadProps) => {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      try {
        validateImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        // Upload file to Supabase Storage
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        // Construct the complete URL using the helper function
        const fileUrl = getStorageUrl(fileName);
        console.log('Uploaded file URL:', fileUrl);
        onUrlChange?.(fileUrl);
        onChange?.(file);
        
        toast({
          title: "Sucesso",
          description: "Arquivo enviado com sucesso",
        });
      } catch (error) {
        console.error('Error handling file:', error);
        toast({
          title: "Erro ao carregar imagem",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        event.target.value = '';
        onChange?.(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const currentImageUrl = currentImage ? getStorageUrl(currentImage) : null;
  console.log('Current image URL:', currentImageUrl);

  return (
    <div className="space-y-2">
      <Input
        name={name}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {(preview || currentImageUrl) && (
        <div className="mt-2">
          <img
            src={preview || currentImageUrl || ''}
            alt="Preview"
            className="h-20 w-32 object-cover rounded"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/placeholder.svg';
            }}
          />
        </div>
      )}
    </div>
  );
};