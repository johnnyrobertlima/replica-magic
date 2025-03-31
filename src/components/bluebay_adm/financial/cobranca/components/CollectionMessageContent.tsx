
import React from "react";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Copy, Mail } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FinancialTitle } from "@/hooks/bluebay/types/financialTypes";

interface CollectionMessageContentProps {
  clientName: string;
  clientTitles: FinancialTitle[];
  onCopy: () => void;
  onSendEmail: () => void;
  isSending: boolean;
}

export const CollectionMessageContent: React.FC<CollectionMessageContentProps> = ({
  clientName,
  clientTitles,
  onCopy,
  onSendEmail,
  isSending
}) => {
  const totalTitulos = clientTitles.length;
  const valorTotalTitulos = clientTitles.reduce((total, title) => total + title.VLRSALDO, 0);
  
  return (
    <div className="bg-slate-50 p-4 rounded-md my-4 text-sm relative">
      {/* Botões de ação (Copiar e Abrir no Outlook) mais visíveis */}
      <div className="flex justify-end gap-2 mb-4">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onCopy}
          className="flex items-center"
        >
          <Copy className="h-3.5 w-3.5 mr-1" /> Copiar Texto
        </Button>
        <Button 
          size="sm"
          variant="default"
          onClick={onSendEmail}
          disabled={isSending}
          className="bg-blue-600 hover:bg-blue-700 flex items-center"
        >
          <Mail className="h-3.5 w-3.5 mr-1" /> Abrir no Outlook
        </Button>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="whitespace-pre-line">
          <p><strong>Assunto:</strong> Títulos em atraso - Bluebay</p>
          <p>&nbsp;</p>
          <p>Olá,</p>
          <p>&nbsp;</p>
          <p>Verificamos que a empresa <strong>{clientName}</strong> possui título(s) com vencimento em aberto junto à Bluebay.</p>
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
          
          <div className="mt-2 mb-4 font-medium">
            <p>Total de Títulos Vencidos: {totalTitulos}</p>
            <p>Valor Total dos Títulos: {formatCurrency(valorTotalTitulos)}</p>
          </div>
          
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
      </ScrollArea>
    </div>
  );
};
