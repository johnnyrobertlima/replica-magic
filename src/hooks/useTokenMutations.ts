import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Token } from "@/types/token";

const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

export const useTokenMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createToken = useMutation({
    mutationFn: async (tokenData: Token) => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;
      
      const { error } = await supabase
        .from("Token_Whats")
        .insert({
          id: tokenData.id,
          NomedoChip: tokenData.NomedoChip,
          "limite por dia": tokenData["limite por dia"],
          Telefone: tokenData.Telefone,
          cliente: tokenData.cliente,
          Status: tokenData.Status,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      toast({ title: "Token criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar token",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateToken = useMutation({
    mutationFn: async (token: Token) => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;

      const { error } = await supabase
        .from("Token_Whats")
        .update({
          NomedoChip: token.NomedoChip,
          "limite por dia": token["limite por dia"],
          Telefone: token.Telefone,
          cliente: token.cliente,
          Status: token.Status,
        })
        .eq("id", token.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      toast({ title: "Token atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar token",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteToken = useMutation({
    mutationFn: async (id: string) => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;

      const { error } = await supabase
        .from("Token_Whats")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      toast({ title: "Token excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir token",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createToken,
    updateToken,
    deleteToken,
  };
};