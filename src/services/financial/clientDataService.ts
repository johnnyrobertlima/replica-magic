
import { supabase } from "@/integrations/supabase/client";

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
