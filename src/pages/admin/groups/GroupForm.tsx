
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Group, GroupFormData } from "./types";

interface GroupFormProps {
  formData: GroupFormData;
  setFormData: (data: GroupFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  editingGroup: Group | null;
}

export const GroupForm = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  editingGroup,
}: GroupFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : editingGroup ? (
          "Atualizar"
        ) : (
          "Criar"
        )}
      </Button>
    </form>
  );
};
