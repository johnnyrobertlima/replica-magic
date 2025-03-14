
/**
 * Re-export all pedido-related queries from their specialized files
 */

// Export unique pedidos operations
export { 
  fetchPedidosUnicos, 
  fetchAllPedidosUnicos 
} from './uniquePedidosQueries';

// Export detailed pedidos operations
export { 
  fetchPedidosDetalhados 
} from './detailedPedidosQueries';

// Export direct pedidos operations
export { 
  fetchAllPedidosDireto 
} from './directPedidosQueries';
