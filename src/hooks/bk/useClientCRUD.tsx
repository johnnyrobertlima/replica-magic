
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BkClient } from "@/types/bk/client";
import { 
  transformClientFromApi, 
  transformClientForSave, 
  prepareClientForInsert 
} from "@/utils/bk/clientTransformation";

export const useClientCRUD = () => {
  const [clients, setClients] = useState<BkClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching all clients from BLUEBAY_PESSOA table...");
      
      // Improved query to fetch ALL clients without restrictions
      const { data, error } = await supabase
        .from("BLUEBAY_PESSOA")
        .select("*")
        .order("PES_CODIGO", { ascending: true });

      if (error) throw error;
      
      console.log(`Fetched ${data?.length || 0} clients from database`);
      
      // Transform API data to client objects
      const transformedClients = data?.map(transformClientFromApi) || [];
      
      setClients(transformedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Ocorreu um erro ao buscar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (client: BkClient) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${client.RAZAOSOCIAL || client.APELIDO || client.PES_CODIGO}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("BLUEBAY_PESSOA")
        .delete()
        .eq("PES_CODIGO", client.PES_CODIGO);

      if (error) throw error;

      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });

      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o cliente.",
        variant: "destructive",
      });
    }
  };

  return {
    clients,
    isLoading,
    fetchClients,
    handleDelete
  };
};
