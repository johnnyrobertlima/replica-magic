
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches items that are currently in the separation process
 */
export async function fetchItensSeparacao() {
  const { data, error } = await supabase
    .from('separacao_itens')
    .select(`
      item_codigo,
      separacoes(status)
    `)
    .eq('separacoes.status', 'pendente');

  if (error) {
    console.error('Erro ao buscar itens em separação:', error);
    return {};
  }

  const itensSeparacaoMap: Record<string, boolean> = {};
  if (data) {
    data.forEach(item => {
      if (item.item_codigo) {
        itensSeparacaoMap[item.item_codigo] = true;
      }
    });
  }

  console.log(`Encontrados ${Object.keys(itensSeparacaoMap).length} itens em separação`);
  return itensSeparacaoMap;
}
