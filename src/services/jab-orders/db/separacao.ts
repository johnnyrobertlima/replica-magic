
import { supabase } from "@/integrations/supabase/client";

export async function fetchItensSeparacao() {
  // Busca itens em separação com status "pendente"
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

  // Cria um mapa de códigos de item -> true para fácil verificação
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
