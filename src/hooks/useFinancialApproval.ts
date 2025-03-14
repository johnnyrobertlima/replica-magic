
import { useClientesFinanceiros } from "@/hooks/useClientesFinanceiros";
import { useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFinancialApproval = () => {
  const { 
    clientesFinanceiros,
    isLoading, 
    hideCard,
    updateVolumeSaudavel
  } = useClientesFinanceiros();
  const { toast } = useToast();

  // Memoize clientes with pending separacoes
  const clientesWithPendingSeparacoes = useMemo(() => {
    return clientesFinanceiros.filter(cliente => 
      cliente.separacoes && cliente.separacoes.length > 0
    );
  }, [clientesFinanceiros]);

  // Handler for approving a separação
  const handleApprove = async (separacaoId: string, cliente: any) => {
    try {
      // Update the separacao status to 'aprovado'
      const { error } = await supabase
        .from('separacoes')
        .update({ status: 'aprovado' })
        .eq('id', separacaoId);

      if (error) throw error;

      // Store the approval record
      const { error: approvalError } = await supabase
        .from('approved_orders')
        .insert({
          separacao_id: separacaoId,
          cliente_data: cliente,
          action: 'aprovado'
        });

      if (approvalError) throw approvalError;

      // Hide the card
      hideCard(separacaoId);

      toast({
        title: "Sucesso",
        description: "Pedido aprovado com sucesso!",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao aprovar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o pedido.",
        variant: "destructive",
      });
    }
  };

  // Handler for rejecting a separação
  const handleReject = async (separacaoId: string, cliente: any) => {
    try {
      // Update the separacao status to 'rejeitado'
      const { error } = await supabase
        .from('separacoes')
        .update({ status: 'rejeitado' })
        .eq('id', separacaoId);

      if (error) throw error;

      // Store the rejection record
      const { error: rejectionError } = await supabase
        .from('approved_orders')
        .insert({
          separacao_id: separacaoId,
          cliente_data: cliente,
          action: 'rejeitado'
        });

      if (rejectionError) throw rejectionError;

      // Hide the card
      hideCard(separacaoId);

      toast({
        title: "Sucesso",
        description: "Pedido rejeitado com sucesso!",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao rejeitar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o pedido.",
        variant: "destructive",
      });
    }
  };

  return {
    clientesWithPendingSeparacoes,
    isLoading,
    handleApprove,
    handleReject,
    handleHideCard: hideCard,
    updateVolumeSaudavel
  };
};
