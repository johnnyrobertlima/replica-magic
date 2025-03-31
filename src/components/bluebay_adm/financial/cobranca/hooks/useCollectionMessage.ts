
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { sendOutlookEmail } from "../utils/outlookEmailUtils";
import { ClientDebtSummary, FinancialTitle } from "@/hooks/bluebay/types/financialTypes";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const useCollectionMessage = (
  selectedClient: ClientDebtSummary | null,
  clientTitles: FinancialTitle[],
  onCollectionConfirm: () => void
) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const createMessageContent = () => {
    if (!selectedClient) return "";
    
    let titlesText = "";
    clientTitles.forEach(title => {
      const formattedDate = title.DTVENCIMENTO ? format(new Date(title.DTVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A';
      
      titlesText += `\nNº do Título: ${title.NUMDOCUMENTO || title.NUMNOTA}
Valor: ${formatCurrency(title.VLRSALDO)}
Vencimento: ${formattedDate}\n`;
    });
    
    // Calcular os totais para incluir na mensagem
    const totalTitulos = clientTitles.length;
    const valorTotalTitulos = clientTitles.reduce((total, title) => total + title.VLRSALDO, 0);

    const totalInfo = `\nTotal de Títulos Vencidos: ${totalTitulos}
Valor Total dos Títulos: ${formatCurrency(valorTotalTitulos)}\n`;
    
    const messageText = `Assunto: Títulos em atraso - Bluebay

Olá,

Verificamos que a empresa ${selectedClient.CLIENTE_NOME} possui título(s) com vencimento em aberto junto à Bluebay.

Pedimos a gentileza de acessar nosso portal para realizar o download dos boletos e efetuar o pagamento o quanto antes, evitando assim encargos adicionais ou restrições comerciais.

Segue abaixo o(s) título(s) vencido(s):
${titlesText}
${totalInfo}
Acesse seu portal através do link abaixo:
🔗 Acessar Portal Bluebay

Em caso de dúvidas, nossa equipe está à disposição para ajudá-lo.

Atenciosamente,
Equipe Financeira – Bluebay Importadora
📧 financeiro@bluebay.com.br
📞 (11) 1234-5678`;

    return messageText;
  };

  const handleCopyText = () => {
    const messageText = createMessageContent();
    
    navigator.clipboard.writeText(messageText).then(() => {
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência",
      });
    }).catch(err => {
      console.error('Erro ao copiar: ', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível copiar o texto",
      });
    });
  };

  const handleSendOutlookEmail = async () => {
    if (!selectedClient) return;
    
    setIsSending(true);
    
    try {
      // Prepare message with linebreaks suitable for email
      const emailBody = createMessageContent().replace(/\n/g, '\n');
      
      // Log para debug
      console.log("Tentando enviar e-mail para:", selectedClient.CLIENTE_NOME);
      
      await sendOutlookEmail({
        subject: `Títulos em atraso - Bluebay - ${selectedClient.CLIENTE_NOME}`,
        body: emailBody,
        clientName: selectedClient.CLIENTE_NOME
      });
      
      // Não mostramos toast aqui, pois ele será mostrado no componente
      
      // Registramos a cobrança como feita após algum tempo
      // para dar tempo do usuário interagir com o cliente de email
      setTimeout(() => {
        onCollectionConfirm();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível abrir o Outlook. Por favor, verifique se seu navegador permite a ação.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    createMessageContent,
    handleCopyText,
    handleSendOutlookEmail
  };
};
