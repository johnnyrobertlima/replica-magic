
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
      
      const pedidoKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}-${item.MPED_NUMORDEM || ''}`;
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
      
      // Verificar se há faturamento para este pedido
      const pedidoKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}-${item.MPED_NUMORDEM}`;
      const faturamentoItems = faturamentoPorPedido.get(pedidoKey) || [];
      
      // Acumular valores de faturamento relacionados a este pedido
      faturamentoItems.forEach(fatItem => {
        data.totalFaturado += fatItem.VALOR_NOTA || 0;
        data.totalItensFaturados += fatItem.QUANTIDADE || 0;
      });
    });
    
    // Processar notas fiscais sem pedidos associados (não identificado)
    const pedidosProcessados = new Set<string>();
    
    // Marcar todos os pedidos já processados
    pedidoItems.forEach(item => {
      if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
      const pedidoKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}-${item.MPED_NUMORDEM}`;
      pedidosProcessados.add(pedidoKey);
    });
    
    // Verificar notas fiscais sem pedidos associados e atribuir ao "Não identificado"
    faturamentoItems.forEach(item => {
      if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) {
        // Nota sem pedido associado vai para "Não identificado"
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
      const pedidoKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}-${item.MPED_NUMORDEM || ''}`;
      
      if (!pedidosProcessados.has(pedidoKey)) {
        // Este item de faturamento não tem pedido correspondente no array de pedidos
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
