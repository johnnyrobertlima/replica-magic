
// Export all database operations from this index file

// Pedidos operations
export { 
  fetchPedidosUnicos,
  fetchAllPedidosUnicos,
  fetchAllPedidosDireto,
  fetchPedidosDetalhados 
} from './pedidos';

// Related data operations
export { fetchRelatedData } from './relatedData';

// Separação operations
export { fetchItensSeparacao } from './separacao';
