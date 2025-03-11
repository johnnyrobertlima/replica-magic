
import { supabase } from "@/integrations/supabase/client";
import { ClienteFinanceiro } from "@/types/financialClient";
import { calculateClientFinancialValues, fetchTitulosVencidos } from "@/utils/financialUtils";

// Fetch financial titles for clients
export const fetchFinancialTitles = async (clientesCodigos: number[]) => {
  const { data: titulos, error } = await supabase
    .from('BLUEBAY_TITULO')
    .select('*')
    .in('PES_CODIGO', clientesCodigos.map(String))
    .in('STATUS', ['1', '2', '3']);

  if (error) throw error;
  return titulos;
};

// Fetch client info
export const fetchClientInfo = async (clientesCodigos: number[]) => {
  const { data: clientes, error } = await supabase
    .from('BLUEBAY_PESSOA')
    .select('PES_CODIGO, APELIDO, volume_saudavel_faturamento')
    .in('PES_CODIGO', clientesCodigos);

  if (error) throw error;
  return clientes;
};

// Fetch pedidos to get REPRESENTANTE codes
export const fetchPedidosForRepresentantes = async (numeroPedidos: string[]) => {
  const { data: pedidos, error } = await supabase
    .from('BLUEBAY_PEDIDO')
    .select('PED_NUMPEDIDO, REPRESENTANTE')
    .eq('CENTROCUSTO', 'JAB')
    .in('PED_NUMPEDIDO', numeroPedidos);

  if (error) throw error;
  return pedidos;
};

// Fetch representantes info
export const fetchRepresentantesInfo = async (representantesCodigos: number[]) => {
  const { data: representantes, error } = await supabase
    .from('BLUEBAY_PESSOA')
    .select('PES_CODIGO, RAZAOSOCIAL')
    .in('PES_CODIGO', representantesCodigos);

  if (error) throw error;
  return representantes;
};

// Process clients data with financial information
export const processClientsData = (
  clientes: any[],
  clienteSeparacoes: Record<number, any[]>,
  clienteToRepresentanteMap: Map<number, number>,
  representantesInfo: Map<number, string>,
  titulos: any[],
  today: Date
) => {
  const clientesMap = new Map<number, ClienteFinanceiro>();

  // Initialize clients map
  if (clientes) {
    clientes.forEach(cliente => {
      if (cliente.PES_CODIGO) {
        // Get representante for this cliente
        const representanteCodigo = clienteToRepresentanteMap.get(cliente.PES_CODIGO);
        const representanteNome = representanteCodigo ? representantesInfo.get(representanteCodigo) || null : null;
        
        clientesMap.set(cliente.PES_CODIGO, {
          PES_CODIGO: cliente.PES_CODIGO,
          APELIDO: cliente.APELIDO,
          volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
          valoresTotais: 0,
          valoresEmAberto: 0,
          valoresVencidos: 0,
          separacoes: clienteSeparacoes[cliente.PES_CODIGO] || [],
          representanteNome: representanteNome
        });
      }
    });
  }

  // Calculate values for each client
  if (titulos) {
    titulos.forEach(titulo => {
      const pesCodigoNumerico = typeof titulo.PES_CODIGO === 'string' 
        ? parseInt(titulo.PES_CODIGO, 10) 
        : titulo.PES_CODIGO;
      
      if (isNaN(pesCodigoNumerico) || !clientesMap.has(pesCodigoNumerico)) return;

      const cliente = clientesMap.get(pesCodigoNumerico)!;
      calculateClientFinancialValues(cliente, titulo, today);
    });
  }

  // Convert map to array
  return Array.from(clientesMap.values());
};

// Fetch títulos vencidos for a specific client
export const fetchValoresVencidos = async (clienteCodigo: number | string): Promise<number> => {
  console.log(`Buscando valores vencidos para cliente ${clienteCodigo}`);
  
  try {
    // First try the database function we just created
    const clienteCodigoStr = clienteCodigo.toString();
    const { data, error } = await supabase.rpc('calcular_valor_vencido', { 
      cliente_codigo: clienteCodigoStr 
    });
    
    if (error) {
      console.error("Erro ao calcular valor vencido via RPC:", error);
      // Fallback to the original method if RPC fails
      return await fetchTitulosVencidos(clienteCodigoStr);
    }
    
    if (data && data[0]) {
      console.log(`Valor vencido via RPC: ${data[0].total_vlr_saldo}`);
      return parseFloat(data[0].total_vlr_saldo) || 0;
    }
    
    // Fallback to the original method
    console.log("Usando método alternativo para buscar valores vencidos");
    return await fetchTitulosVencidos(clienteCodigoStr);
  } catch (error) {
    console.error("Erro ao buscar via RPC, tentando método alternativo:", error);
    return await fetchTitulosVencidos(clienteCodigo.toString());
  }
};
