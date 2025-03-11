
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export const exportOrderToCSV = (order: any, toast: ReturnType<typeof useToast>['toast']) => {
  try {
    const clienteData = order.clienteData;
    const approvedSeparacao = order.clienteData.separacoes.find(
      sep => sep.id === order.separacaoId
    );

    if (!approvedSeparacao) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível encontrar os dados para exportação",
        variant: "destructive"
      });
      return;
    }

    let approvalDate;
    if (order.approvedAt && typeof order.approvedAt.toLocaleString === 'function') {
      approvalDate = order.approvedAt;
    } else if (order.approvedAt && order.approvedAt._type === 'Date' && order.approvedAt.value) {
      approvalDate = new Date(order.approvedAt.value.iso || order.approvedAt.value.value);
    } else {
      approvalDate = new Date();
    }

    const clientInfo = {
      'Cliente': clienteData.APELIDO || 'N/A',
      'Código Cliente': clienteData.PES_CODIGO || 'N/A',
      'Representante': clienteData.representanteNome || 'N/A',
      'Volume Saudável': clienteData.volumeSaudavel ? formatCurrency(clienteData.volumeSaudavel) : 'N/A',
      'Valores Totais': formatCurrency(clienteData.valoresTotais),
      'Valores em Aberto': formatCurrency(clienteData.valoresEmAberto),
      'Valores Vencidos': formatCurrency(clienteData.valoresVencidos),
      'Data de Aprovação': approvalDate.toLocaleString('pt-BR')
    };

    if (!approvedSeparacao.separacao_itens || approvedSeparacao.separacao_itens.length === 0) {
      toast({
        title: "Sem itens para exportar",
        description: "Este pedido não contém itens para exportação",
        variant: "destructive"
      });
      return;
    }

    const items = approvedSeparacao.separacao_itens.map((item: any) => ({
      'Pedido': item.pedido,
      'Código do Item': item.ITEM_CODIGO || item.item_codigo,
      'Descrição': item.DESCRICAO || item.descricao || 'N/A',
      'Quantidade Pedida': item.QTDE_PEDIDA || item.quantidade_pedida || 0,
      'Quantidade Saldo': item.QTDE_SALDO || 1,
      'Valor Unitário': formatCurrency(item.VALOR_UNITARIO || item.valor_unitario || 0),
      'Valor Total': formatCurrency((item.QTDE_SALDO || 1) * (item.VALOR_UNITARIO || item.valor_unitario || 0))
    }));

    const clientHeaders = Object.keys(clientInfo);
    const itemHeaders = Object.keys(items[0] || {});

    const csvContent = [
      'INFORMAÇÕES DO CLIENTE',
      clientHeaders.map(header => `"${header}"`).join(','),
      Object.values(clientInfo).map(value => `"${value}"`).join(','),
      '',
      'ITENS DO PEDIDO',
      itemHeaders.map(header => `"${header}"`).join(','),
      ...items.map(item => 
        Object.values(item).map(value => `"${value}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const formattedDate = format(approvalDate, 'dd-MM-yyyy');
    link.setAttribute('download', `pedido-${clienteData.APELIDO || 'cliente'}-${formattedDate}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação concluída",
      description: "Dados exportados com sucesso",
    });
  } catch (error) {
    console.error("Erro ao exportar dados:", error);
    toast({
      title: "Erro na exportação",
      description: "Ocorreu um erro ao exportar os dados",
      variant: "destructive"
    });
  }
};
