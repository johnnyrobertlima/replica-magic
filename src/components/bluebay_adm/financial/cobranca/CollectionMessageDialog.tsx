
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Mail } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { FinancialTitle, ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sendOutlookEmail } from "./utils/outlookEmailUtils";

interface CollectionMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClient: ClientDebtSummary | null;
  clientTitles: FinancialTitle[];
  onCollectionConfirm: () => void;
}

export const CollectionMessageDialog: React.FC<CollectionMessageDialogProps> = ({
  isOpen,
  onClose,
  selectedClient,
  clientTitles,
  onCollectionConfirm
}) => {
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
      await sendOutlookEmail({
        subject: `Títulos em atraso - Bluebay - ${selectedClient.CLIENTE_NOME}`,
        body: createMessageContent().replace(/\n/g, '<br>'),
        clientName: selectedClient.CLIENTE_NOME
      });
      
      toast({
        title: "E-mail aberto no Outlook",
        description: "O e-mail foi preparado no Outlook e está pronto para envio",
      });
      
      // Registramos a cobrança como feita
      onCollectionConfirm();
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível abrir o Outlook. Por favor, verifique se ele está instalado e configurado.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Mensagem de Cobrança - {selectedClient?.CLIENTE_NOME}</AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="bg-slate-50 p-4 rounded-md my-4 text-sm relative">
          <div className="absolute right-2 top-2 flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCopyText}
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copiar
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={handleSendOutlookEmail}
              disabled={isSending}
            >
              <Mail className="h-3.5 w-3.5 mr-1" /> Abrir no Outlook
            </Button>
          </div>
          
          <div className="mt-6 whitespace-pre-line">
            <p><strong>Assunto:</strong> Títulos em atraso - Bluebay</p>
            <p>&nbsp;</p>
            <p>Olá,</p>
            <p>&nbsp;</p>
            <p>Verificamos que a empresa <strong>{selectedClient?.CLIENTE_NOME}</strong> possui título(s) com vencimento em aberto junto à Bluebay.</p>
            <p>&nbsp;</p>
            <p>Pedimos a gentileza de acessar nosso portal para realizar o download dos boletos e efetuar o pagamento o quanto antes, evitando assim encargos adicionais ou restrições comerciais.</p>
            <p>&nbsp;</p>
            <p>Segue abaixo o(s) título(s) vencido(s):</p>
            <p>&nbsp;</p>
            
            {clientTitles.map((title, index) => {
              const formattedDate = title.DTVENCIMENTO 
                ? format(new Date(title.DTVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) 
                : 'N/A';
              
              return (
                <div key={index} className="mb-1">
                  <p>Nº do Título: {title.NUMDOCUMENTO || title.NUMNOTA}</p>
                  <p>Valor: {formatCurrency(title.VLRSALDO)}</p>
                  <p>Vencimento: {formattedDate}</p>
                  <p>&nbsp;</p>
                </div>
              );
            })}
            
            {(() => {
              const totalTitulos = clientTitles.length;
              const valorTotalTitulos = clientTitles.reduce((total, title) => total + title.VLRSALDO, 0);
              
              return (
                <div className="mt-2 mb-4 font-medium">
                  <p>Total de Títulos Vencidos: {totalTitulos}</p>
                  <p>Valor Total dos Títulos: {formatCurrency(valorTotalTitulos)}</p>
                </div>
              );
            })()}
            
            <p>Acesse seu portal através do link abaixo:</p>
            <p>🔗 Acessar Portal Bluebay</p>
            <p>&nbsp;</p>
            <p>Em caso de dúvidas, nossa equipe está à disposição para ajudá-lo.</p>
            <p>&nbsp;</p>
            <p>Atenciosamente,</p>
            <p>Equipe Financeira – Bluebay Importadora</p>
            <p>📧 financeiro@bluebay.com.br</p>
            <p>📞 (11) 1234-5678</p>
          </div>
        </div>
        
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>Sair</Button>
          <Button onClick={onCollectionConfirm}>Realizar Cobrança</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
