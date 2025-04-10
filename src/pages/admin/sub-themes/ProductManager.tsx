
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EntityForm } from "./EntityForm";
import { EntityTable } from "./EntityTable";
import { Product } from "./types";

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products" as any)
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      // Make sure to safely cast the data to the Product type
      const safeData = (data || []) as unknown as Product[];
      setProducts(safeData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    
    try {
      const { error } = await supabase
        .from("products" as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
      
      await fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir produto",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Produtos</h2>
      
      <EntityForm
        entityName="Produto"
        tableName="products"
        onSuccess={fetchProducts}
      />
      
      <EntityTable
        entityName="produto"
        entities={products}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
