import { useState } from "react";
import { Input } from "@/components/ui/input";
import { validateImage } from "@/utils/imageUtils";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  name: string;
  currentImage?: string;
  onChange?: (file: File | null) => void;
}

export const ImageUpload = ({ name, currentImage, onChange }: ImageUploadProps) => {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        
        // Notify parent component
        onChange?.(file);
      } catch (error) {
        toast({
          title: "Erro ao carregar imagem",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        event.target.value = '';
        onChange?.(null);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Input
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />
      {(preview || currentImage) && (
        <div className="mt-2">
          <img
            src={preview || currentImage}
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