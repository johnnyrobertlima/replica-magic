
import { supabase } from '@/integrations/supabase/client';
import type { Separacao, SeparacaoItem } from '@/types/separacao';

export async function fetchSeparacoes(centrocusto: 'JAB' | 'BK' = 'JAB'): Promise<Separacao[]> {
  try {
    // Fetch separations not in 'completed' status
    const { data, error } = await supabase
      .from('separacoes')
      .select('*, separacao_itens(*)')
      .eq('centrocusto', centrocusto)
      .neq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar separações:', error);
      return [];
    }

    // Use a type assertion that avoids the deep recursion
    return data as unknown as Separacao[];
  } catch (error) {
    console.error('Exceção ao buscar separações:', error);
    return [];
  }
}

export async function fetchSeparacaoById(id: string): Promise<Separacao | null> {
  try {
    const { data, error } = await supabase
      .from('separacoes')
      .select('*, separacao_itens(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar separação por ID:', error);
      return null;
    }

    // Use a type assertion that avoids the deep recursion
    return data as unknown as Separacao | null;
  } catch (error) {
    console.error('Exceção ao buscar separação por ID:', error);
    return null;
  }
}

export async function updateSeparacaoStatus(id: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('separacoes')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status da separação:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exceção ao atualizar status da separação:', error);
    return false;
  }
}

export async function deleteSeparacao(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('separacoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir separação:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exceção ao excluir separação:', error);
    return false;
  }
}
