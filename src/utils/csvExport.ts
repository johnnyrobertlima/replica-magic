
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

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Criar uma única planilha para todas as informações
    // Primeiro, vamos criar as células para as informações do cliente
    const clientSheet = XLSX.utils.json_to_sheet(clientInfo);
    
    // Definir o range atual da planilha
    const clientRange = XLSX.utils.decode_range(clientSheet['!ref'] || 'A1');
    const lastRowClient = clientRange.e.r;
    
    // Calcular onde começar a seção de itens (2 linhas após as informações do cliente)
    const itemsStartRow = lastRowClient + 3; // +3 para ter 2 linhas em branco
    
    // Converter os itens para um sheet sem incluir no workbook ainda
    const itemsSheet = XLSX.utils.json_to_sheet(items);
    
    // Obter o range da planilha de itens
    const itemsRange = XLSX.utils.decode_range(itemsSheet['!ref'] || 'A1');
    
    // Criar uma planilha combinada
    const combinedSheet = clientSheet;
    
    // Adicionar título para a seção de itens (na linha após as 2 linhas em branco)
    combinedSheet[XLSX.utils.encode_cell({r: lastRowClient + 2, c: 0})] = {t: 's', v: 'ITENS DO PEDIDO'};
    
    // Copiar os cabeçalhos dos itens
    for (let c = 0; c <= itemsRange.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({r: 0, c: c});
      const headerCell = itemsSheet[cellAddress];
      if (headerCell) {
        combinedSheet[XLSX.utils.encode_cell({r: itemsStartRow, c: c})] = headerCell;
      }
    }
    
    // Copiar os dados dos itens
    for (let r = 1; r <= itemsRange.e.r; r++) {
      for (let c = 0; c <= itemsRange.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({r: r, c: c});
        const dataCell = itemsSheet[cellAddress];
        if (dataCell) {
          combinedSheet[XLSX.utils.encode_cell({r: itemsStartRow + r, c: c})] = dataCell;
        }
      }
    }
    
    // Atualizar o range da planilha combinada
    const newLastRow = itemsStartRow + itemsRange.e.r;
    const newLastCol = Math.max(clientRange.e.c, itemsRange.e.c);
    combinedSheet['!ref'] = XLSX.utils.encode_range({
      s: {r: 0, c: 0},
      e: {r: newLastRow, c: newLastCol}
    });
    
    // Adicionar a planilha combinada ao workbook
    XLSX.utils.book_append_sheet(wb, combinedSheet, "Pedido");
    
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
