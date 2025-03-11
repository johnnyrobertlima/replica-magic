
import { supabase } from "@/integrations/supabase/client";

export const fetchFinancialTitles = async (clienteCodigos: readonly number[]): Promise<any[]> => {
  try {
    // Convert number array to string array for Supabase query
    const clienteCodigosStrings = clienteCodigos.map(String);
    
    const { data, error } = await supabase
      .from('BLUEBAY_TITULO')
      .select('*')
      .in('PES_CODIGO', clienteCodigosStrings);

    if (error) {
      console.error("Erro ao buscar títulos financeiros:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar títulos financeiros:", error);
    return [];
  }
};

export const fetchClientInfo = async (clienteCodigos: readonly number[]): Promise<any[]> => {
  try {
    const clienteCodigosStrings = clienteCodigos.map(String);
    
    const { data, error } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, RAZAOSOCIAL, APELIDO, volume_saudavel_faturamento')
      .in('PES_CODIGO', clienteCodigosStrings);

    if (error) {
      console.error("Erro ao buscar informações dos clientes:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar informações dos clientes:", error);
    return [];
  }
};

export const fetchPedidosForRepresentantes = async (numeroPedidos: readonly number[]): Promise<any[]> => {
  try {
    // Convert numbers to strings for Supabase query
    const numeroPedidosStrings = numeroPedidos.map(numero => String(numero));
    
    const { data, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('PED_NUMPEDIDO, REPRESENTANTE')
      .in('PED_NUMPEDIDO', numeroPedidosStrings);

    if (error) {
      console.error("Erro ao buscar pedidos para representantes:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar pedidos para representantes:", error);
    return [];
  }
};

export const fetchRepresentantesInfo = async (representantesCodigos: readonly number[]): Promise<any[]> => {
  try {
    // Convert numbers to strings for Supabase query
    const representantesCodigosStrings = representantesCodigos.map(codigo => String(codigo));
    
    const { data, error } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, RAZAOSOCIAL')
      .in('PES_CODIGO', representantesCodigosStrings);

    if (error) {
      console.error("Erro ao buscar informações dos representantes:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar informações dos representantes:", error);
    return [];
  }
};

export const processClientsData = (
  clientes: any[],
  clienteSeparacoes: Record<number, any[]>,
  clienteToRepresentanteMap: Map<number, number>,
  representantesInfo: Map<number, string>,
  titulos: any[],
  today: Date
): any[] => {
  return clientes.map(cliente => {
    const separacoes = clienteSeparacoes[cliente.PES_CODIGO] || [];
    const representanteCodigo = clienteToRepresentanteMap.get(cliente.PES_CODIGO);
    const representanteNome = representanteCodigo ? representantesInfo.get(representanteCodigo) : null;

    // Filter titulos for the current client
    const titulosCliente = titulos.filter(titulo => titulo.PES_CODIGO === String(cliente.PES_CODIGO));

    // Calculate total values based on titulos
    const valoresTotais = titulosCliente.reduce((acc, titulo) => acc + (titulo.VLRTITULO || 0), 0);
    const valoresEmAberto = titulosCliente.reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0);

    return {
      ...cliente,
      separacoes: separacoes,
      representante: representanteCodigo,
      representanteNome: representanteNome,
      valoresTotais: valoresTotais,
      valoresEmAberto: valoresEmAberto,
      valoresVencidos: 0, // Initialize as 0, will be fetched later
      volume_saudavel_faturamento: cliente.volume_saudavel_faturamento || null // Ensure this field is included
    };
  });
};

export const fetchValoresVencidos = async (clienteCodigo: number | string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('calcular_valor_vencido', { 
        cliente_codigo: String(clienteCodigo)
      });

    if (error) throw error;

    return data?.[0]?.total_vlr_saldo || 0;
  } catch (error) {
    console.error('Error fetching valores vencidos:', error);
    return 0;
  }
}
