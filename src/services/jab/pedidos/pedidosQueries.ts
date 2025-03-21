
/**
 * This file re-exports all pedido queries from their respective files
 * for backwards compatibility
 */

export { 
  fetchPedidosUnicos,
  fetchAllPedidosUnicos
} from './uniquePedidosQueries';

export {
  fetchPedidosDetalhados
} from './detailedPedidosQueries';

export {
  fetchAllPedidosDireto
} from './directPedidosQueries';
