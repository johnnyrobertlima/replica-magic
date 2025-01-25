import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface ImageUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUrlField({ value, onChange }: ImageUrlFieldProps) {
  return (
    <div>
      <Label htmlFor="imageUrl">Imagem da Campanha (opcional)</Label>
      <ImageUpload
        name="imageUrl"
        currentImage={value}
        onUrlChange={onChange}
        bucket="campaign-images"
      />
    </div>
  );
}