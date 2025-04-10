
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SymbolSelector } from "./SymbolSelector";
import { ColorPicker } from "./ColorPicker";

interface EntityFormProps {
  entityName: string;
  tableName: string;
  onSuccess: () => void;
  includeSymbol?: boolean;
  includeColor?: boolean;
}

export function EntityForm({ 
  entityName, 
  tableName, 
  onSuccess, 
  includeSymbol = false,
  includeColor = false
}: EntityFormProps) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [color, setColor] = useState("");
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
      let dataToInsert: Record<string, any> = { name };
      
      if (includeSymbol) {
        dataToInsert.symbol = symbol;
      }
      
      if (includeColor) {
        dataToInsert.color = color;
      }
      
      const { error } = await supabase
        .from(tableName as any)
        .insert([dataToInsert]);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `${entityName} criado com sucesso`,
      });
      
      setName("");
      if (includeSymbol) setSymbol("");
      if (includeColor) setColor("");
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
      
      {includeSymbol && (
        <div className="mt-4">
          <label className="text-sm text-muted-foreground mb-2 block">
            Escolha um símbolo
          </label>
          <SymbolSelector value={symbol} onChange={setSymbol} />
        </div>
      )}
      
      {includeColor && (
        <div className="mt-4">
          <label className="text-sm text-muted-foreground mb-2 block">
            Escolha uma cor
          </label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
      )}
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : `Adicionar ${entityName}`}
      </Button>
    </form>
  );
}
