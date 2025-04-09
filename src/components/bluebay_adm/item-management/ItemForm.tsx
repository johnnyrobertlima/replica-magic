
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemFormProps {
  item: any | null;
  onSave: (item: any) => Promise<void>;
  groups: any[];
}

export const ItemForm = ({ item, onSave, groups }: ItemFormProps) => {
  const [formData, setFormData] = useState({
    ITEM_CODIGO: "",
    DESCRICAO: "",
    GRU_CODIGO: "",
    GRU_DESCRICAO: "",
    CODIGOAUX: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        ITEM_CODIGO: item.ITEM_CODIGO || "",
        DESCRICAO: item.DESCRICAO || "",
        GRU_CODIGO: item.GRU_CODIGO || "",
        GRU_DESCRICAO: item.GRU_DESCRICAO || "",
        CODIGOAUX: item.CODIGOAUX || "",
      });
    } else {
      setFormData({
        ITEM_CODIGO: "",
        DESCRICAO: "",
        GRU_CODIGO: "",
        GRU_DESCRICAO: "",
        CODIGOAUX: "",
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroupChange = (value: string) => {
    const selectedGroup = groups.find((g) => g.GRU_CODIGO === value);
    if (selectedGroup) {
      setFormData((prev) => ({
        ...prev,
        GRU_CODIGO: value,
        GRU_DESCRICAO: selectedGroup.GRU_DESCRICAO,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        GRU_CODIGO: value,
        GRU_DESCRICAO: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="ITEM_CODIGO">Código do Item</Label>
            <Input
              id="ITEM_CODIGO"
              name="ITEM_CODIGO"
              value={formData.ITEM_CODIGO}
              onChange={handleChange}
              placeholder="Código do item"
              required
              readOnly={!!item} // Only allow editing code for new items
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="CODIGOAUX">Código Auxiliar</Label>
            <Input
              id="CODIGOAUX"
              name="CODIGOAUX"
              value={formData.CODIGOAUX}
              onChange={handleChange}
              placeholder="Código auxiliar (opcional)"
            />
          </div>
        </div>
        
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="DESCRICAO">Descrição</Label>
          <Input
            id="DESCRICAO"
            name="DESCRICAO"
            value={formData.DESCRICAO}
            onChange={handleChange}
            placeholder="Descrição do item"
            required
          />
        </div>
        
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="GRU_CODIGO">Grupo</Label>
          <Select 
            value={formData.GRU_CODIGO} 
            onValueChange={handleGroupChange}
          >
            <SelectTrigger id="GRU_CODIGO">
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.GRU_CODIGO} value={group.GRU_CODIGO}>
                  {group.GRU_DESCRICAO}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
};
