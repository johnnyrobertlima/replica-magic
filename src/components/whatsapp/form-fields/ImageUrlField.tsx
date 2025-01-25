import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ImageUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUrlField({ value, onChange }: ImageUrlFieldProps) {
  const { toast } = useToast();

  const handleCopyUrl = () => {
    if (!value) {
      toast({
        title: "Nenhuma imagem",
        description: "Faça o upload de uma imagem primeiro para copiar a URL",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: "URL copiada",
        description: "A URL da imagem foi copiada para a área de transferência",
      });
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="imageUrl">Imagem da Campanha (opcional)</Label>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar URL
          </Button>
        )}
      </div>
      <ImageUpload
        name="imageUrl"
        currentImage={value}
        onUrlChange={onChange}
        bucket="campaign-images"
      />
    </div>
  );
}