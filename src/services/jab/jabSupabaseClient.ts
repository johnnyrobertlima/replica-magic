
// Re-export all functions from the divided files
export { 
  fetchPedidosUnicos,
  fetchAllPedidosUnicos,
  fetchPedidosDetalhados,
  fetchAllPedidosDireto 
} from './pedidos/pedidosQueries';

export { 
  fetchTotals 
} from './totals/totalsQueries';

export { 
  fetchRelatedData 
} from './related/relatedDataQueries';

export { 
  fetchItensSeparacao 
} from './separation/separationQueries';
