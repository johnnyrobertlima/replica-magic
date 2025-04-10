
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EntityForm } from "./EntityForm";
import { EntityTable } from "./EntityTable";
import { Theme } from "./types";

export function ThemeManager() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchThemes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("themes" as any)
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      setThemes(data as Theme[] || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar temas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este tema?")) return;
    
    try {
      const { error } = await supabase
        .from("themes" as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Tema excluído com sucesso",
      });
      
      await fetchThemes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir tema",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Temas</h2>
      
      <EntityForm
        entityName="Tema"
        tableName="themes"
        onSuccess={fetchThemes}
      />
      
      <EntityTable
        entityName="tema"
        entities={themes}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
