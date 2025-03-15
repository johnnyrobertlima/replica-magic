
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { getStorageUrl } from "@/utils/imageUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banner } from "@/types/banner";

interface BannerFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  editingBanner?: Banner | null;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const BannerForm = ({
  onSubmit,
  editingBanner,
  isSubmitting,
  onCancel,
}: BannerFormProps) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <Input 
            name="title" 
            required 
            defaultValue={editingBanner?.title}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Texto do Botão</label>
          <Input 
            name="button_text" 
            required 
            defaultValue={editingBanner?.button_text}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Link do Botão</label>
          <Input 
            name="button_link" 
            type="url" 
            required 
            defaultValue={editingBanner?.button_link}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Link do YouTube</label>
          <Input 
            name="youtube_url" 
            type="url" 
            defaultValue={editingBanner?.youtube_url || ''}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Duração (segundos)</label>
          <Input 
            name="duration" 
            type="number" 
            min="1"
            required
            defaultValue={editingBanner?.duration ? editingBanner.duration / 1000 : 5}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Localização da Página</label>
          <Select 
            name="page_location" 
            defaultValue={editingBanner?.page_location || 'index'}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecionar localização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="index">Página Inicial</SelectItem>
              <SelectItem value="bluebay">Bluebay</SelectItem>
              <SelectItem value="both">Ambos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Imagem</label>
          <ImageUpload
            name="image"
            currentImage={editingBanner ? getStorageUrl(editingBanner.image_url) : undefined}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição</label>
        <Textarea 
          name="description" 
          required 
          defaultValue={editingBanner?.description}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          {editingBanner ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};
