
import { useToast } from "@/hooks/use-toast";
import { exportToExcelWithSections } from "@/utils/excelUtils";
import { format } from "date-fns";

export const useExportToExcel = () => {
  const { toast } = useToast();

  const handleExportToExcel = (orderId: string, approvedOrders: any[]) => {
    try {
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
      
      // Verificar se há itens para exportar
      if (!approvedSeparacao.separacao_itens_flat || approvedSeparacao.separacao_itens_flat.length === 0) {
        toast({
          title: "Erro ao exportar",
          description: "Não há itens para exportar neste pedido",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Exportando pedido:", {
        separacaoId: orderToExport.separacaoId,
        clienteNome: orderToExport.clienteData.APELIDO || 'Cliente sem nome',
        quantidadeItens: approvedSeparacao.separacao_itens_flat.length
      });
      
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
      const itemsData = approvedSeparacao.separacao_itens_flat.map(item => ({
        'Pedido': item.pedido || '-',
        'SKU': item.item_codigo || '-',
        'Descrição': item.descricao || '-',
        'Quantidade': item.quantidade_pedida || 0,
        'Quantidade Entregue': item.quantidade_entregue || 0,
        'Valor Unitário': item.valor_unitario || 0,
        'Valor Total': item.valor_total || (item.quantidade_pedida * item.valor_unitario) || 0
      }));
      
      // Export to Excel with sections
      const clientName = (orderToExport.clienteData.APELIDO || 'cliente')
        .replace(/[\/\\?%*:|"<>]/g, '-') // Remover caracteres inválidos para nomes de arquivo
        .substring(0, 30); // Limitar tamanho do nome
      const fileName = `pedido-aprovado-${clientName}-${format(new Date(), 'dd-MM-yyyy')}`;
      
      // Usar try-catch específico para a exportação
      try {
        const exportedCount = exportToExcelWithSections(headerData, itemsData, fileName);
        
        if (exportedCount > 0) {
          toast({
            title: "Exportação concluída",
            description: `${exportedCount} registros exportados com sucesso`,
            variant: "default",
          });
        } else {
          throw new Error("Não foi possível exportar os dados");
        }
      } catch (exportError) {
        console.error("Erro na exportação:", exportError);
        toast({
          title: "Erro na exportação",
          description: "Não foi possível exportar os dados. Verifique o console para mais detalhes.",
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
