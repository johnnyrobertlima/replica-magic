
import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FaturamentoItem, PedidoItem } from '@/services/bluebay/dashboardComercialTypes';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

// Formatador de números para moeda brasileira
const formatCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

// Formatador de números com separador de milhar
const formatNumber = new Intl.NumberFormat('pt-BR');

interface CentroCustoData {
  nome: string;
  totalFaturado: number;
  totalItensFaturados: number;
  ticketMedioFaturado: number;
  totalPedidos: number;
  totalItensPedidos: number;
}

interface CentroCustoIndicatorsProps {
  faturamentoItems: FaturamentoItem[];
  pedidoItems: PedidoItem[];
  isLoading: boolean;
  selectedCentroCusto: string | null;
  onCentroCustoSelect: (centroCusto: string | null) => void;
}

// Função para normalizar valores antes da comparação
const normalizeValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

// Função auxiliar para encontrar pedido correspondente
const encontrarPedidoCorrespondente = (item: any, pedidos: any[]) => {
  if (!item.PED_NUMPEDIDO && !item.PED_ANOBASE) return null;

  const itemNumPedido = normalizeValue(item.PED_NUMPEDIDO);
  const itemAnoBase = normalizeValue(item.PED_ANOBASE);
  
  // Primeiro, tentamos com o MPED_NUMORDEM
  if (item.MPED_NUMORDEM !== null && item.MPED_NUMORDEM !== undefined) {
    const itemNumOrdem = normalizeValue(item.MPED_NUMORDEM);
    
    const pedido = pedidos.find(p => 
      normalizeValue(p.PED_NUMPEDIDO) === itemNumPedido &&
      normalizeValue(p.PED_ANOBASE) === itemAnoBase &&
      normalizeValue(p.MPED_NUMORDEM) === itemNumOrdem
    );
    
    if (pedido) return pedido;
  }

  // Se não encontrou com MPED_NUMORDEM, tenta só com PED_NUMPEDIDO e PED_ANOBASE
  // Esta é uma estratégia de fallback para melhorar a associação
  const pedido = pedidos.find(p => 
    normalizeValue(p.PED_NUMPEDIDO) === itemNumPedido &&
    normalizeValue(p.PED_ANOBASE) === itemAnoBase
  );

  return pedido;
};

export const CentroCustoIndicators = ({ 
  faturamentoItems, 
  pedidoItems, 
  isLoading,
  selectedCentroCusto,
  onCentroCustoSelect
}: CentroCustoIndicatorsProps) => {
  // Processar os dados por CENTROCUSTO
  const indicadoresPorCentroCusto = useMemo(() => {
    const centroCustoMap = new Map<string, CentroCustoData>();
    
    // Criar mapa de faturamento por número de pedido
    const faturamentoPorPedido = new Map<string, FaturamentoItem[]>();
    faturamentoItems.forEach(item => {
      if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
      
      const pedidoKey = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-${normalizeValue(item.MPED_NUMORDEM || '')}`;
      if (!faturamentoPorPedido.has(pedidoKey)) {
        faturamentoPorPedido.set(pedidoKey, []);
      }
      faturamentoPorPedido.get(pedidoKey)?.push(item);
    });
    
    // Processar dados de pedidos
    pedidoItems.forEach(item => {
      const centroCusto = item.CENTROCUSTO || 'Não identificado';
      
      if (!centroCustoMap.has(centroCusto)) {
        centroCustoMap.set(centroCusto, {
          nome: centroCusto,
          totalFaturado: 0,
          totalItensFaturados: 0,
          ticketMedioFaturado: 0,
          totalPedidos: 0,
          totalItensPedidos: 0
        });
      }
      
      const data = centroCustoMap.get(centroCusto)!;
      
      // Acumular valores de pedidos
      const valorPedido = (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
      data.totalPedidos += valorPedido;
      data.totalItensPedidos += item.QTDE_PEDIDA || 0;
      
      // Verificar se há faturamento para este pedido usando a nova função de busca
      const pedidoKey1 = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-${normalizeValue(item.MPED_NUMORDEM)}`;
      const pedidoKey2 = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-`;
      
      // Procura com a chave completa ou com a chave parcial (sem MPED_NUMORDEM)
      const faturamentoItems1 = faturamentoPorPedido.get(pedidoKey1) || [];
      const faturamentoItems2 = faturamentoPorPedido.get(pedidoKey2) || [];
      const todosItens = [...faturamentoItems1, ...faturamentoItems2];
      
      // Acumular valores de faturamento relacionados a este pedido
      todosItens.forEach(fatItem => {
        data.totalFaturado += fatItem.VALOR_NOTA || 0;
        data.totalItensFaturados += fatItem.QUANTIDADE || 0;
      });
    });
    
    // Processar notas fiscais sem pedidos associados (não identificado)
    const pedidosProcessados = new Set<string>();
    
    // Marcar todos os pedidos já processados
    pedidoItems.forEach(item => {
      if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
      
      // Gerar ambas as chaves possíveis (com e sem MPED_NUMORDEM)
      const pedidoKey1 = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-${normalizeValue(item.MPED_NUMORDEM)}`;
      const pedidoKey2 = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-`;
      
      pedidosProcessados.add(pedidoKey1);
      pedidosProcessados.add(pedidoKey2);
    });
    
    // Verificar notas fiscais sem pedidos associados e atribuir ao "Não identificado"
    faturamentoItems.forEach(item => {
      // Casos em que a nota não tem referência a pedido
      if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) {
        const centroCusto = 'Não identificado';
        
        if (!centroCustoMap.has(centroCusto)) {
          centroCustoMap.set(centroCusto, {
            nome: centroCusto,
            totalFaturado: 0,
            totalItensFaturados: 0,
            ticketMedioFaturado: 0,
            totalPedidos: 0,
            totalItensPedidos: 0
          });
        }
        
        const data = centroCustoMap.get(centroCusto)!;
        data.totalFaturado += item.VALOR_NOTA || 0;
        data.totalItensFaturados += item.QUANTIDADE || 0;
        return;
      }
      
      // Verificar se este item de faturamento já foi processado através de um pedido
      const pedidoCorrespondente = encontrarPedidoCorrespondente(item, pedidoItems);
      
      if (!pedidoCorrespondente) {
        // Este item de faturamento não tem pedido correspondente
        const centroCusto = 'Não identificado';
        
        if (!centroCustoMap.has(centroCusto)) {
          centroCustoMap.set(centroCusto, {
            nome: centroCusto,
            totalFaturado: 0,
            totalItensFaturados: 0,
            ticketMedioFaturado: 0,
            totalPedidos: 0,
            totalItensPedidos: 0
          });
        }
        
        const data = centroCustoMap.get(centroCusto)!;
        data.totalFaturado += item.VALOR_NOTA || 0;
        data.totalItensFaturados += item.QUANTIDADE || 0;
      }
    });
    
    // Calcular ticket médio para cada centro de custo
    centroCustoMap.forEach(data => {
      data.ticketMedioFaturado = data.totalItensFaturados > 0 ? 
        data.totalFaturado / data.totalItensFaturados : 0;
    });
    
    // Converter Map para array e ordenar por nome
    return Array.from(centroCustoMap.values())
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [faturamentoItems, pedidoItems]);

  const handleCentroCustoClick = (centroCusto: string) => {
    if (selectedCentroCusto === centroCusto) {
      // Se já está selecionado, desmarcar (filtro removido)
      onCentroCustoSelect(null);
    } else {
      // Selecionar este centroCusto como filtro
      onCentroCustoSelect(centroCusto);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Indicadores por Centro de Custo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Indicadores por Centro de Custo</CardTitle>
        {selectedCentroCusto && (
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-secondary"
            onClick={() => onCentroCustoSelect(null)}
          >
            Limpar filtro
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-3 px-4 font-medium">Centro de Custo</th>
                <th className="py-3 px-4 font-medium text-right">Total Faturado</th>
                <th className="py-3 px-4 font-medium text-right">Itens Faturados</th>
                <th className="py-3 px-4 font-medium text-right">TM por Item Faturado</th>
                <th className="py-3 px-4 font-medium text-right">Total de Pedido</th>
                <th className="py-3 px-4 font-medium text-right">Itens Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {indicadoresPorCentroCusto.map((centro, index) => (
                <tr 
                  key={index} 
                  className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 cursor-pointer ${
                    selectedCentroCusto === centro.nome ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => handleCentroCustoClick(centro.nome)}
                >
                  <td className="py-3 px-4 font-medium flex items-center">
                    {selectedCentroCusto === centro.nome && (
                      <Check className="h-4 w-4 mr-2 text-primary" />
                    )}
                    {centro.nome}
                  </td>
                  <td className="py-3 px-4 text-right">{formatCurrency.format(centro.totalFaturado)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber.format(centro.totalItensFaturados)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency.format(centro.ticketMedioFaturado)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency.format(centro.totalPedidos)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber.format(centro.totalItensPedidos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
