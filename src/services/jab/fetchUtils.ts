
export {
  fetchPedidosUnicos,
  fetchAllPedidosUnicos
} from './pedidosUtils';

export {
  fetchAllPedidosDireto,
  processOrdersFetch
} from './pedidosDiretosUtils';

export {
  fetchPedidosDetalhados
} from './pedidosDetalhadosUtils';

export {
  fetchItensSeparacao
} from './separacaoUtils';

export {
  fetchRelatedData
} from './entityUtils';

export {
  fetchPedidosPorCliente,
  fetchItensPorCliente,
  fetchEstoqueParaItens
} from './clientDataService';

export {
  processOrdersData,
  groupOrdersByNumber,
  processClientOrdersData
} from './orderProcessUtils';

export type { 
  RelatedDataResponse,
  PedidosDetalhadosResponse,
  PedidosUnicosResponse 
} from './types';
