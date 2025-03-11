
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import * as XLSX from 'xlsx';

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

    const clientInfo = [{
      'Cliente': clienteData.APELIDO || 'N/A',
      'Código Cliente': clienteData.PES_CODIGO || 'N/A',
      'Representante': clienteData.representanteNome || 'N/A',
      'Volume Saudável': clienteData.volumeSaudavel ? formatCurrency(clienteData.volumeSaudavel) : 'N/A',
      'Valores Totais': formatCurrency(clienteData.valoresTotais),
      'Valores em Aberto': formatCurrency(clienteData.valoresEmAberto),
      'Valores Vencidos': formatCurrency(clienteData.valoresVencidos),
      'Data de Aprovação': approvalDate.toLocaleString('pt-BR')
    }];

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

    // Criar workbook e adicionar as worksheets
    const wb = XLSX.utils.book_new();
    
    // Adicionar informações do cliente
    const wsClient = XLSX.utils.json_to_sheet(clientInfo);
    XLSX.utils.book_append_sheet(wb, wsClient, "Informações do Cliente");
    
    // Adicionar itens do pedido
    const wsItems = XLSX.utils.json_to_sheet(items);
    XLSX.utils.book_append_sheet(wb, wsItems, "Itens do Pedido");

    // Gerar o arquivo Excel
    const formattedDate = format(approvalDate, 'dd-MM-yyyy');
    const fileName = `pedido-${clienteData.APELIDO || 'cliente'}-${formattedDate}.xlsx`;
    
    // Converter para um array buffer e criar o blob
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Criar link de download e trigger o download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação concluída",
      description: "Dados exportados com sucesso em formato Excel",
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
