
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Utility function to clean test data from the database
 */
export const cleanTestData = async () => {
  const { toast } = useToast();
  
  try {
    // Clean approved_orders table
    const { error: ordersError } = await supabase
      .from('approved_orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // A non-existent ID to delete all
    
    if (ordersError) {
      console.error("Error cleaning approved orders:", ordersError);
      throw ordersError;
    }
    
    // Clean separacoes table
    const { error: separacoesError } = await supabase
      .from('separacoes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // A non-existent ID to delete all
    
    if (separacoesError) {
      console.error("Error cleaning separacoes:", separacoesError);
      throw separacoesError;
    }
    
    // Clean separacao_itens table (related to separacoes)
    const { error: itensError } = await supabase
      .from('separacao_itens')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // A non-existent ID to delete all
    
    if (itensError) {
      console.error("Error cleaning separacao_itens:", itensError);
      throw itensError;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error cleaning test data:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao limpar os dados de teste.",
      variant: "destructive",
    });
    return { success: false, error };
  }
};

/**
 * Hook to provide data cleanup functionality
 */
export const useDataCleanup = () => {
  const { toast } = useToast();
  
  const handleCleanupData = async () => {
    const result = await cleanTestData();
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Dados de teste foram limpos com sucesso.",
        variant: "default",
      });
      
      // Reload the page to reflect the changes
      window.location.reload();
    }
  };
  
  return { handleCleanupData };
};
