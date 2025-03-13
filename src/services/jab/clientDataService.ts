
/**
 * Module that re-exports client data service functions
 * to maintain a clean import structure
 */

export { fetchPedidosPorCliente } from './fetching/clientOrdersFetcher';
export { fetchItensPorCliente } from './fetching/clientItemsFetcher';
export { fetchEstoqueParaItens } from './fetching/stockFetcher';
