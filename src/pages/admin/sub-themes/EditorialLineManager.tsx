
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EntityForm } from "./EntityForm";
import { EntityTable } from "./EntityTable";

interface EditorialLine {
  id: string;
  name: string;
}

export function EditorialLineManager() {
  const [editorialLines, setEditorialLines] = useState<EditorialLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEditorialLines = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("editorial_lines")
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      setEditorialLines(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar linhas editoriais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEditorialLines();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta linha editorial?")) return;
    
    try {
      const { error } = await supabase
        .from("editorial_lines")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Linha editorial excluída com sucesso",
      });
      
      await fetchEditorialLines();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir linha editorial",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Linhas Editoriais</h2>
      
      <EntityForm
        entityName="Linha Editorial"
        tableName="editorial_lines"
        onSuccess={fetchEditorialLines}
      />
      
      <EntityTable
        entityName="linha editorial"
        entities={editorialLines}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
