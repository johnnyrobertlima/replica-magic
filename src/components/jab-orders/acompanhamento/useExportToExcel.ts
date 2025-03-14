
import { useToast } from "@/hooks/use-toast";
import { exportToExcelWithSections } from "@/utils/excelUtils";
import { format } from "date-fns";

export const useExportToExcel = () => {
  const { toast } = useToast();

  const handleExportToExcel = (orderId: string, approvedOrders: any[]) => {
    const orderToExport = approvedOrders.find(order => order.separacaoId === orderId);
    
    if (!orderToExport || !orderToExport.clienteData) {
      toast({
        title: "Erro ao exportar",
        description: "Dados insuficientes para exportação",
        variant: "destructive",
      });
      return;
    }
    
    const approvedSeparacao = orderToExport.clienteData.separacoes && 
      orderToExport.clienteData.separacoes.length > 0 ? 
      orderToExport.clienteData.separacoes.find(
        sep => sep && sep.id === orderToExport.separacaoId
      ) : null;
    
    if (!approvedSeparacao) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível encontrar os dados da separação",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare header data
    const headerData = [
      {
        Cliente: orderToExport.clienteData.APELIDO || 'Cliente sem nome',
        'Data de Aprovação': new Date(orderToExport.approvedAt).toLocaleString('pt-BR'),
        'Aprovado por': orderToExport.userEmail || 'Não informado',
        Status: 'Aprovado',
        'Valor Total': approvedSeparacao.valor_total || 0,
        'Quantidade de Itens': approvedSeparacao.quantidade_itens || 0
      }
    ];
    
    // Prepare items data (the rows will be added automatically with 2 empty rows in between)
    let itemsData = [];
    
    if (approvedSeparacao.separacao_itens_flat && approvedSeparacao.separacao_itens_flat.length > 0) {
      // Add items
      itemsData = approvedSeparacao.separacao_itens_flat.map(item => ({
        'Pedido': item.pedido || '-',
        'SKU': item.item_codigo || '-',
        'Descrição': item.descricao || '-',
        'Quantidade': item.quantidade_pedida || 0,
        'Valor Unitário': item.valor_unitario || 0,
        'Valor Total': item.valor_total || (item.quantidade_pedida * item.valor_unitario) || 0
      }));
    }
    
    // Export to Excel with sections
    const clientName = orderToExport.clienteData.APELIDO || 'cliente';
    const fileName = `pedido-aprovado-${clientName}-${format(new Date(), 'dd-MM-yyyy')}`;
    
    const exportedCount = exportToExcelWithSections(headerData, itemsData, fileName);
    
    if (exportedCount > 0) {
      toast({
        title: "Exportação concluída",
        description: `${exportedCount} registros exportados com sucesso`,
        variant: "default",
      });
    } else {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados",
        variant: "destructive",
      });
    }
  };

  return { handleExportToExcel };
};
