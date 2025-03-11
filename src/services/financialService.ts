
import { supabase } from "@/integrations/supabase/client";
import type { ClienteFinanceiro } from "@/types/financialClient";

export const fetchClientInfo = async (clienteCodigo: number | string) => {
  const { data, error } = await supabase
    .from('BLUEBAY_PESSOA')
    .select('*')
    .eq('PES_CODIGO', clienteCodigo.toString())
    .maybeSingle();

  if (error) {
    console.error("Error fetching client info:", error);
    return null;
  }

  return data;
};

export const fetchFinancialTitles = async (clientesCodigos: Array<string | number>) => {
  const stringClientesCodigos = clientesCodigos.map(String);

  const { data, error } = await supabase
    .from('BLUEBAY_TITULO')
    .select('*')
    .in('PES_CODIGO', stringClientesCodigos);

  if (error) {
    console.error("Error fetching financial titles:", error);
    return [];
  }

  return data || [];
};

export const fetchRepresentantesInfo = async (representantesCodigos?: Array<string | number>) => {
  try {
    if (representantesCodigos && representantesCodigos.length === 0) {
      return [];
    }

    let query = supabase
      .from('BLUEBAY_REPRESENTANTE')
      .select('PES_CODIGO');
    
    if (representantesCodigos) {
      const stringRepresentantesCodigos = representantesCodigos.map(String);
      query = query.in('PES_CODIGO', stringRepresentantesCodigos);
    }

    const { data: representantesData, error: representantesError } = await query;

    if (representantesError) throw representantesError;

    if (!representantesData?.length) {
      return [];
    }

    const representantesCodigos2 = representantesData.map(rep => String(rep.PES_CODIGO));

    const { data: pessoasData, error: pessoasError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
      .in('PES_CODIGO', representantesCodigos2);

    if (pessoasError) throw pessoasError;

    return pessoasData || [];
  } catch (error) {
    console.error("Error fetching representantes info:", error);
    return [];
  }
};

export const fetchPedidosForRepresentantes = async (representanteCodigos: Array<string | number>) => {
  try {
    const stringRepresentanteCodigos = representanteCodigos.map(String);

    const { data, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('REPRESENTANTE, PES_CODIGO, PED_NUMPEDIDO')
      .in('REPRESENTANTE', stringRepresentanteCodigos);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching pedidos for representantes:", error);
    return [];
  }
};

export const fetchValoresVencidos = async (clienteCodigo: string | number): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('BLUEBAY_TITULO')
      .select('VLRSALDO')
      .eq('PES_CODIGO', String(clienteCodigo))
      .lt('DTVENCIMENTO', new Date().toISOString());

    if (error) throw error;

    return data?.reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0) || 0;
  } catch (error) {
    console.error('Error fetching valores vencidos:', error);
    return 0;
  }
};

// Add the missing processClientsData function
export const processClientsData = (
  clientes: any[],
  clienteSeparacoes: Record<number, any[]>,
  clienteToRepresentanteMap: Map<number, number>,
  representantesInfo: Map<number, string>,
  titulos: any[],
  today: Date
): ClienteFinanceiro[] => {
  if (!clientes || clientes.length === 0) {
    return [];
  }
  
  return clientes.map(cliente => {
    // Get the PES_CODIGO as number
    const clienteCodigo = Number(cliente.PES_CODIGO);
    
    // Get separacoes for the client
    const separacoes = clienteSeparacoes[clienteCodigo] || [];
    
    // Get representante info
    const representanteCodigo = clienteToRepresentanteMap.get(clienteCodigo);
    const representanteNome = representanteCodigo ? representantesInfo.get(representanteCodigo) : null;
    
    // Get titulos for the client
    const clienteTitulos = titulos.filter(titulo => String(titulo.PES_CODIGO) === String(clienteCodigo));
    
    // Calculate financial values
    const valoresTotais = clienteTitulos.reduce((acc, titulo) => acc + (titulo.VLRTITULO || 0), 0);
    const valoresEmAberto = clienteTitulos.reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0);
    
    // Calculate valores vencidos
    const valoresVencidos = clienteTitulos
      .filter(titulo => {
        const dtVencimento = titulo.DTVENCIMENTO ? new Date(titulo.DTVENCIMENTO) : null;
        return dtVencimento && dtVencimento < today && titulo.VLRSALDO > 0;
      })
      .reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0);
    
    // Create the ClienteFinanceiro object
    return {
      PES_CODIGO: clienteCodigo,
      APELIDO: cliente.APELIDO,
      volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
      valoresTotais,
      valoresEmAberto,
      valoresVencidos,
      separacoes,
      representanteNome
    };
  });
};
