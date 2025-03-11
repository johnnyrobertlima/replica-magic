
import { supabase } from "@/integrations/supabase/client";

export const fetchClientInfo = async (clienteCodigo: number | string) => {
  const { data, error } = await supabase
    .from('BLUEBAY_PESSOA')
    .select('*')
    .eq('PES_CODIGO', String(clienteCodigo))
    .maybeSingle();

  if (error) {
    console.error("Error fetching client info:", error);
    return null;
  }

  return data;
};

export const fetchFinancialTitles = async (clientesCodigos: string[] | number[]) => {
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

export const fetchRepresentantesInfo = async () => {
  try {
    const { data: representantesData, error: representantesError } = await supabase
      .from('BLUEBAY_REPRESENTANTE')
      .select('PES_CODIGO');

    if (representantesError) throw representantesError;

    if (!representantesData?.length) {
      return [];
    }

    const representantesCodigos = representantesData.map(rep => String(rep.PES_CODIGO));

    const { data: pessoasData, error: pessoasError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
      .in('PES_CODIGO', representantesCodigos);

    if (pessoasError) throw pessoasError;

    return pessoasData || [];
  } catch (error) {
    console.error("Error fetching representantes info:", error);
    return [];
  }
};

export const fetchPedidosForRepresentantes = async (representanteCodigos: string[] | number[]) => {
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

export const processClientsData = async (clients: any[]) => {
  const clientesProcessados = [];

  for (const cliente of clients) {
    try {
      const titulos = await fetchFinancialTitles([String(cliente.PES_CODIGO)]);
      
      const valoresEmAberto = titulos.reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0);
      
      const hoje = new Date();
      const valoresVencidos = titulos
        .filter(titulo => {
          const dtVencimento = titulo.DTVENCIMENTO ? new Date(titulo.DTVENCIMENTO) : null;
          return dtVencimento && dtVencimento < hoje && titulo.VLRSALDO > 0;
        })
        .reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0);

      clientesProcessados.push({
        ...cliente,
        valoresEmAberto,
        valoresVencidos
      });
    } catch (error) {
      console.error(`Error processing client ${cliente.PES_CODIGO}:`, error);
      clientesProcessados.push({
        ...cliente,
        valoresEmAberto: 0,
        valoresVencidos: 0
      });
    }
  }

  return clientesProcessados;
};
