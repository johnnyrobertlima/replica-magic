
import type { ClienteFinanceiro } from "@/types/financialClient";

export const processClientsData = (
  clientes: any[],
  clienteSeparacoes: Record<number, any[]>,
  clienteToRepresentanteMap: Map<number, number>,
  representantesInfo: Map<number, string>,
  titulos: any[],
  today: Date
): ClienteFinanceiro[] => {
  return clientes.map(cliente => {
    const valoresEmAberto = titulos
      .filter(titulo => String(titulo.PES_CODIGO) === String(cliente.PES_CODIGO))
      .reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0);

    const valoresVencidos = titulos
      .filter(titulo => {
        const dtVencimento = titulo.DTVENCIMENTO ? new Date(titulo.DTVENCIMENTO) : null;
        return dtVencimento && 
               dtVencimento < today && 
               String(titulo.PES_CODIGO) === String(cliente.PES_CODIGO) && 
               titulo.VLRSALDO > 0;
      })
      .reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0);

    const valoresTotais = titulos
      .filter(titulo => String(titulo.PES_CODIGO) === String(cliente.PES_CODIGO))
      .reduce((acc, titulo) => acc + (titulo.VLRTITULO || 0), 0);

    const representanteId = clienteToRepresentanteMap.get(cliente.PES_CODIGO);
    const representanteNome = representanteId ? representantesInfo.get(representanteId) : null;

    return {
      ...cliente,
      valoresTotais,
      valoresEmAberto,
      valoresVencidos,
      separacoes: clienteSeparacoes[cliente.PES_CODIGO] || [],
      representanteNome
    };
  });
};
