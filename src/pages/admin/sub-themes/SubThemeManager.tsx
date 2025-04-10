
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EntityForm } from "./EntityForm";
import { EntityTable } from "./EntityTable";

interface SubTheme {
  id: string;
  name: string;
}

export function SubThemeManager() {
  const [subThemes, setSubThemes] = useState<SubTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubThemes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sub_themes")
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      setSubThemes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar sub temas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubThemes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este sub tema?")) return;
    
    try {
      const { error } = await supabase
        .from("sub_themes")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Sub tema excluído com sucesso",
      });
      
      await fetchSubThemes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir sub tema",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Sub Temas</h2>
      
      <EntityForm
        entityName="Sub Tema"
        tableName="sub_themes"
        onSuccess={fetchSubThemes}
      />
      
      <EntityTable
        entityName="sub tema"
        entities={subThemes}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
