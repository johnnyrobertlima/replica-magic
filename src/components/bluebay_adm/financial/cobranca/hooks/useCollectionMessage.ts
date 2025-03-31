
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { sendOutlookEmail, sendMailtoEmail } from "../utils/outlookEmailUtils";
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

  const handleOpenOutlookWeb = async () => {
    if (!selectedClient) return;
    
    setIsSending(true);
    
    try {
      const emailBody = createMessageContent();
      
      toast({
        title: "Abrindo Outlook Web",
        description: "Estamos abrindo o Outlook Web em uma nova aba",
        duration: 5000,
      });
      
      console.log("Tentando enviar e-mail para:", selectedClient.CLIENTE_NOME);
      
      // Usar o sujeito como uma string separada para manter a formatação correta
      const emailSubject = `Títulos em atraso - Bluebay - ${selectedClient.CLIENTE_NOME}`;
      
      await sendOutlookEmail({
        to: "financeiro@bluebay.com.br", // Email de exemplo - pode ser personalizado
        subject: emailSubject,
        body: emailBody,
        clientName: selectedClient.CLIENTE_NOME
      });
      
      // Adicionamos um delay para dar tempo de o cliente responder
      setTimeout(() => {
        // Registramos a cobrança como realizada
        onCollectionConfirm();
        
        toast({
          title: "Cobrança registrada",
          description: `A cobrança para ${selectedClient.CLIENTE_NOME} foi registrada.`,
        });
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao abrir Outlook Web:', error);
      toast({
        variant: "destructive",
        title: "Erro ao abrir Outlook Web",
        description: "Por favor, use a opção 'Copiar Texto' e cole em seu cliente de e-mail manualmente.",
        duration: 7000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMailto = async () => {
    if (!selectedClient) return;
    
    setIsSending(true);
    
    try {
      const emailBody = createMessageContent();
      
      toast({
        title: "Abrindo cliente de e-mail padrão",
        description: "Se o cliente de e-mail não abrir automaticamente, use a opção 'Copiar Texto'",
        duration: 5000,
      });
      
      console.log("Tentando enviar e-mail via mailto para:", selectedClient.CLIENTE_NOME);
      
      await sendMailtoEmail({
        subject: `Títulos em atraso - Bluebay - ${selectedClient.CLIENTE_NOME}`,
        body: emailBody,
        clientName: selectedClient.CLIENTE_NOME
      });
      
      // Registramos a cobrança como realizada após um curto período
      setTimeout(() => {
        onCollectionConfirm();
        
        toast({
          title: "Cobrança registrada",
          description: `A cobrança para ${selectedClient.CLIENTE_NOME} foi registrada.`,
        });
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast({
        variant: "destructive",
        title: "Erro ao abrir cliente de e-mail",
        description: "Por favor, use a opção 'Copiar Texto' e cole em seu cliente de e-mail manualmente.",
        duration: 7000,
      });
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    createMessageContent,
    handleCopyText,
    handleOpenOutlookWeb,
    handleSendMailto
  };
};
