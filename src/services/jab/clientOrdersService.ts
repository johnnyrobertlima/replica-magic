
import type { UseJabOrdersOptions } from "@/types/jabOrders";
import { fetchPedidosPorCliente } from "./pedidosPorClienteUtils";
import { processClientOrdersData } from "./orderProcessUtils";
import { fetchItensSeparacao } from "./separacaoUtils";

export async function fetchJabOrdersByClient({
  dateRange
}: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>): Promise<any> {
  if (!dateRange?.from || !dateRange?.to) {
    return { clientGroups: {}, totalCount: 0 };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  // Fetch orders grouped by client with optimized function
  const clientesComPedidos = await fetchPedidosPorCliente(dataInicial, dataFinal);
  
  if (!clientesComPedidos || !Array.isArray(clientesComPedidos) || clientesComPedidos.length === 0) {
    return { clientGroups: {}, totalCount: 0 };
  }

  // Fetch separation items
  const itensSeparacao = await fetchItensSeparacao();
  
  // Process client data using optimized function
  const clientGroups = await processClientOrdersData(dataInicial, dataFinal, clientesComPedidos, itensSeparacao);

  return {
    clientGroups,
    totalCount: clientesComPedidos.length,
    itensSeparacao
  };
}
