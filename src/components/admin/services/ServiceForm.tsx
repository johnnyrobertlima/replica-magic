import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubServiceForm } from "./SubServiceForm";
import { icons } from "./icons";
import { ImageUpload } from "../ImageUpload";

interface ServiceFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editingService: any;
  onCancel: () => void;
}

export const ServiceForm = ({ onSubmit, editingService, onCancel }: ServiceFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 border p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <Input 
            name="title" 
            required 
            defaultValue={editingService?.title}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Ícone</label>
          <Select name="icon" required defaultValue={editingService?.icon}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um ícone" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {icons.map((icon) => (
                <SelectItem key={icon.name} value={icon.name}>
                  <div className="flex items-center gap-2">
                    {icon.icon}
                    <span>{icon.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Imagem de Capa</label>
        <ImageUpload
          name="cover_image"
          currentImage={editingService?.cover_image_url}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição Curta</label>
        <Textarea 
          name="description" 
          required 
          defaultValue={editingService?.description}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição Detalhada</label>
        <Textarea 
          name="detailed_description" 
          defaultValue={editingService?.detailed_description}
          rows={4}
        />
      </div>

      <SubServiceForm
        subServices={editingService?.sub_services || []}
        onChange={(subServices) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'sub_services';
          input.value = JSON.stringify(subServices);
          const oldInput = document.querySelector('input[name="sub_services"]');
          if (oldInput) {
            oldInput.remove();
          }
          document.forms[0].appendChild(input);
        }}
      />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {editingService ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};