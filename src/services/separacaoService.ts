import { supabase } from '@/integrations/supabase/client';
import type { Separacao } from '@/types/separacao';

export async function fetchSeparacoes(centrocusto: 'JAB' | 'BK' = 'JAB'): Promise<Separacao[]> {
  try {
    // Fetch separations not in 'completed' status
    const { data, error } = await supabase
      .from('separacoes')
      .select('*')
      .eq('centrocusto', centrocusto)
      .neq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar separações:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exceção ao buscar separações:', error);
    return [];
  }
}

export async function fetchSeparacaoById(id: string): Promise<Separacao | null> {
  try {
    const { data, error } = await supabase
      .from('separacoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar separação por ID:', error);
      return null;
    }

    return data;
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
