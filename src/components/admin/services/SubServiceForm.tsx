import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SubService {
  title: string;
  description: string;
}

interface SubServiceFormProps {
  subServices?: SubService[];
  onChange: (subServices: SubService[]) => void;
}

export const SubServiceForm = ({ subServices = [], onChange }: SubServiceFormProps) => {
  const [localSubServices, setLocalSubServices] = useState<SubService[]>(subServices);

  useEffect(() => {
    setLocalSubServices(subServices);
  }, [subServices]);

  const addSubService = () => {
    const newSubServices = [...localSubServices, { title: "", description: "" }];
    setLocalSubServices(newSubServices);
    onChange(newSubServices);
  };

  const removeSubService = (index: number) => {
    const newSubServices = localSubServices.filter((_, i) => i !== index);
    setLocalSubServices(newSubServices);
    onChange(newSubServices);
  };

  const updateSubService = (index: number, field: keyof SubService, value: string) => {
    const newSubServices = localSubServices.map((service, i) => {
      if (i === index) {
        return { ...service, [field]: value };
      }
      return service;
    });
    setLocalSubServices(newSubServices);
    onChange(newSubServices);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Sub-serviços</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSubService}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {localSubServices.map((service, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => removeSubService(index)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <Input
              value={service.title}
              onChange={(e) => updateSubService(index, "title", e.target.value)}
              placeholder="Título do sub-serviço"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              value={service.description}
              onChange={(e) => updateSubService(index, "description", e.target.value)}
              placeholder="Descrição do sub-serviço"
            />
          </div>
        </div>
      ))}
    </div>
  );
};