
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
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
        description: `Nome do ${entityName.toLowerCase()} é obrigatório`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from(tableName as any)
        .insert([{ name }]);
      
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
        description: error.message || `Erro ao criar ${entityName.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder={`Nome do ${entityName.toLowerCase()}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : `Adicionar ${entityName}`}
      </Button>
    </form>
  );
}
