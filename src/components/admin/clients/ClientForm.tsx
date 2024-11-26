import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Loader2 } from "lucide-react";
import { Client } from "@/types/client";

interface ClientFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  editingClient: Client | null;
  isLoading?: boolean;
}

export const ClientForm = ({ onSubmit, onCancel, editingClient, isLoading }: ClientFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 border p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome</label>
          <Input 
            name="name" 
            required 
            defaultValue={editingClient?.name}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Website</label>
          <Input 
            name="website_url" 
            type="url" 
            defaultValue={editingClient?.website_url}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Logo</label>
          <ImageUpload 
            name="logo" 
            currentImage={editingClient?.logo_url}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            editingClient ? 'Salvar' : 'Criar'
          )}
        </Button>
      </div>
    </form>
  );
};