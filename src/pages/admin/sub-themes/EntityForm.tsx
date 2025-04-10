
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface EntityFormProps {
  entityName: string;
  tableName: string;
  onSuccess: () => void;
}

export function EntityForm({ entityName, tableName, onSuccess }: EntityFormProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: `Nome do ${entityName} é obrigatório`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use a type assertion to handle the dynamic table name
      const { error } = await supabase
        .from(tableName as any)
        .insert({ name });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `${entityName} criado com sucesso`,
      });
      
      setName("");
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || `Erro ao criar ${entityName}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg border shadow-sm">
      <div>
        <Label htmlFor="name">{`Nome do ${entityName}`}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Digite o nome do ${entityName}`}
          className="mt-1"
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : `Salvar ${entityName}`}
      </Button>
    </form>
  );
}
