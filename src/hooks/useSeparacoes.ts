
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Separacao, SeparacaoItem } from "@/types/separacoes";

export const useSeparacoes = () => {
  const queryClient = useQueryClient();

  const { data: separacoes = [], isLoading } = useQuery({
    queryKey: ['separacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('separacoes')
        .select(`
          *,
          itens:separacao_itens(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Separacao[];
    },
  });

  const createSeparacao = useMutation({
    mutationFn: async ({ 
      cliente_nome, 
      cliente_codigo,
      itens 
    }: { 
      cliente_nome: string;
      cliente_codigo: number;
      itens: Omit<SeparacaoItem, 'id' | 'separacao_id' | 'created_at'>[];
    }) => {
      const valor_total = itens.reduce((acc, item) => acc + item.valor_total, 0);
      
      const { data: separacao, error: separacaoError } = await supabase
        .from('separacoes')
        .insert({
          cliente_nome,
          cliente_codigo,
          valor_total,
          quantidade_itens: itens.length,
        })
        .select()
        .single();

      if (separacaoError) throw separacaoError;

      const { error: itensError } = await supabase
        .from('separacao_itens')
        .insert(
          itens.map(item => ({
            ...item,
            separacao_id: separacao.id,
          }))
        );

      if (itensError) throw itensError;
      return separacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['separacoes'] });
    },
  });

  const updateSeparacaoStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Separacao['status'] }) => {
      const { error } = await supabase
        .from('separacoes')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['separacoes'] });
    },
  });

  return {
    separacoes,
    isLoading,
    createSeparacao,
    updateSeparacaoStatus,
  };
};
