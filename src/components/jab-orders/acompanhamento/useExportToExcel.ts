
import { useToast } from "@/hooks/use-toast";
import { exportToExcelWithSections } from "@/utils/excelUtils";
import { format } from "date-fns";

export const useExportToExcel = () => {
  const { toast } = useToast();

  const handleExportToExcel = (orderId: string, approvedOrders: any[]) => {
    try {
      console.log("Iniciando exportação para Excel do pedido:", orderId);
      console.log("Total de pedidos disponíveis:", approvedOrders.length);
      
      const orderToExport = approvedOrders.find(order => order.separacaoId === orderId);
      
      if (!orderToExport) {
        console.error("Pedido não encontrado para exportação:", orderId);
        toast({
          title: "Erro ao exportar",
          description: "Pedido não encontrado",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Dados do pedido para exportação:", {
        separacaoId: orderToExport.separacaoId,
        clienteNome: orderToExport.clienteData?.APELIDO || 'Cliente sem nome'
      });
      
      // Verificar se os dados do cliente estão disponíveis
      if (!orderToExport.clienteData) {
        console.error("Dados do cliente não disponíveis para exportação");
        toast({
          title: "Erro ao exportar",
          description: "Dados do cliente não disponíveis",
          variant: "destructive",
        });
        return;
      }
      
      // Verificar se as separações existem
      if (!orderToExport.clienteData.separacoes || 
          !Array.isArray(orderToExport.clienteData.separacoes) || 
          orderToExport.clienteData.separacoes.length === 0) {
        console.error("Não há separações disponíveis para exportação");
        toast({
          title: "Erro ao exportar",
          description: "Não há separações disponíveis",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Buscando separação aprovada com ID:", orderToExport.separacaoId);
      
      // Encontrar a separação aprovada
      const approvedSeparacao = orderToExport.clienteData.separacoes.find(
        (sep: any) => sep && sep.id === orderToExport.separacaoId
      );
      
      if (!approvedSeparacao) {
        console.error("Separação aprovada não encontrada com ID:", orderToExport.separacaoId);
        toast({
          title: "Erro ao exportar",
          description: "Separação aprovada não encontrada",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Separação encontrada:", {
        id: approvedSeparacao.id,
        valor_total: approvedSeparacao.valor_total,
        quantidade_itens: approvedSeparacao.quantidade_itens
      });
      
      // Verificar se há itens para exportar
      if (!approvedSeparacao.separacao_itens_flat || 
          !Array.isArray(approvedSeparacao.separacao_itens_flat) || 
          approvedSeparacao.separacao_itens_flat.length === 0) {
        console.error("Não há itens para exportar nesta separação");
        toast({
          title: "Erro ao exportar",
          description: "Não há itens para exportar neste pedido",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Total de itens para exportação:", approvedSeparacao.separacao_itens_flat.length);
      
      // Prepare header data
      const headerData = [
        {
          Cliente: orderToExport.clienteData.APELIDO || 'Cliente sem nome',
          'Data de Aprovação': orderToExport.approvedAt ? new Date(orderToExport.approvedAt).toLocaleString('pt-BR') : 'Não informado',
          'Aprovado por': orderToExport.userEmail || 'Não informado',
          Status: 'Aprovado',
          'Valor Total': approvedSeparacao.valor_total || 0,
          'Quantidade de Itens': approvedSeparacao.quantidade_itens || 0
        }
      ];
      
      // Garantir que todos os itens tenham quantidade_entregue (mesmo que seja 0)
      const itemsWithDelivery = approvedSeparacao.separacao_itens_flat.map(item => ({
        ...item,
        quantidade_entregue: item.quantidade_entregue || 0
      }));
      
      // Prepare items data
      const itemsData = itemsWithDelivery.map(item => ({
        'Pedido': item.pedido || '-',
        'SKU': item.item_codigo || '-',
        'Descrição': item.descricao || '-',
        'Quantidade': item.quantidade_pedida || 0,
        'Quantidade Entregue': item.quantidade_entregue || 0,
        'Saldo': (item.quantidade_pedida || 0) - (item.quantidade_entregue || 0),
        'Valor Unitário': item.valor_unitario || 0,
        'Valor Total': item.valor_total || ((item.quantidade_pedida || 0) * (item.valor_unitario || 0)) || 0,
        'Valor Faturado': (item.quantidade_entregue || 0) * (item.valor_unitario || 0)
      }));
      
      console.log("Dados de cabeçalho preparados:", headerData);
      console.log("Número de itens processados para exportação:", itemsData.length);
      
      // Sanitize client name and generate file name
      const clientName = (orderToExport.clienteData.APELIDO || 'cliente')
        .replace(/[\/\\?%*:|"<>]/g, '-')
        .substring(0, 30);
      
      const fileName = `pedido-aprovado-${clientName}-${format(new Date(), 'dd-MM-yyyy')}`;
      console.log("Nome do arquivo de exportação:", fileName);
      
      // Export to Excel with sections
      try {
        const exportedCount = exportToExcelWithSections(headerData, itemsData, fileName);
        
        if (exportedCount > 0) {
          console.log("Exportação concluída com sucesso:", exportedCount);
          toast({
            title: "Exportação concluída",
            description: `${exportedCount} registros exportados com sucesso`,
            variant: "default",
          });
        } else {
          throw new Error("Nenhum registro foi exportado");
        }
      } catch (exportError) {
        console.error("Erro na exportação para Excel:", exportError);
        toast({
          title: "Erro na exportação",
          description: "Falha ao exportar para Excel. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro geral na exportação:", error);
      toast({
        title: "Erro ao processar exportação",
        description: "Ocorreu um erro ao preparar os dados para exportação",
        variant: "destructive",
      });
    }
  };

  return { handleExportToExcel };
};
