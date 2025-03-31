
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MessageSquare, Copy, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { FinancialTitle, ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";
import { differenceInDays, format } from "date-fns";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ptBR } from "date-fns/locale";

interface CobrancaTableProps {
  titles: FinancialTitle[];
  isLoading: boolean;
  onClientSelect: (clientCode: string) => void;
  onCollectionStatusChange?: (clientCode: string, status: string) => void;
  collectedClients?: string[];
  showCollected?: boolean;
}

export const CobrancaTable: React.FC<CobrancaTableProps> = ({ 
  titles, 
  isLoading,
  onClientSelect,
  onCollectionStatusChange,
  collectedClients = [],
  showCollected = false
}) => {
  const [expandedClients, setExpandedClients] = useState<Set<string | number>>(new Set());
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDebtSummary | null>(null);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  // Filter only overdue titles (DTVENCIMENTO < today and STATUS is not "paid")
  const overdueUnpaidTitles = titles.filter(title => {
    const isPaid = title.STATUS === '3'; // Status 3 = Paid
    const isCanceled = title.STATUS === '4'; // Status 4 = Canceled
    const vencimentoDate = title.DTVENCIMENTO ? new Date(title.DTVENCIMENTO) : null;
    const isOverdue = vencimentoDate && vencimentoDate < new Date();
    
    return !isPaid && !isCanceled && isOverdue && title.VLRSALDO > 0;
  });

  // Apply collected clients filter
  const filteredTitles = showCollected 
    ? overdueUnpaidTitles.filter(title => collectedClients.includes(String(title.PES_CODIGO)))
    : overdueUnpaidTitles.filter(title => !collectedClients.includes(String(title.PES_CODIGO)));

  if (filteredTitles.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">
          {showCollected 
            ? "Nenhum título cobrado encontrado" 
            : "Nenhum título vencido encontrado"}
        </p>
        <p className="text-sm text-muted-foreground">
          {showCollected 
            ? "Não há títulos que foram cobrados" 
            : "Todos os títulos estão pagos, dentro do prazo ou já foram cobrados"}
        </p>
      </div>
    );
  }

  // Group by client and calculate totals
  const clientSummaries: Record<string | number, ClientDebtSummary> = {};
  
  filteredTitles.forEach(title => {
    const clientKey = String(title.PES_CODIGO);
    
    if (!clientSummaries[clientKey]) {
      clientSummaries[clientKey] = {
        PES_CODIGO: title.PES_CODIGO,
        CLIENTE_NOME: title.CLIENTE_NOME,
        TOTAL_SALDO: 0,
        DIAS_VENCIDO_MEDIO: 0,
        DIAS_VENCIDO_MAXIMO: 0,
        QUANTIDADE_TITULOS: 0,
        VALOR_TOTAL: 0
      };
    }
    
    const summary = clientSummaries[clientKey];
    summary.TOTAL_SALDO += title.VLRSALDO;
    summary.VALOR_TOTAL += title.VLRTITULO;
    summary.QUANTIDADE_TITULOS++;
    
    // Calculate days overdue and track maximum
    if (title.DTVENCIMENTO) {
      const vencimentoDate = new Date(title.DTVENCIMENTO);
      const diasVencido = differenceInDays(new Date(), vencimentoDate);
      
      // Update maximum overdue days if this title is older
      if (diasVencido > summary.DIAS_VENCIDO_MAXIMO) {
        summary.DIAS_VENCIDO_MAXIMO = diasVencido;
      }
      
      summary.DIAS_VENCIDO_MEDIO += diasVencido;
    }
  });
  
  // Calculate average days overdue
  Object.values(clientSummaries).forEach(summary => {
    if (summary.QUANTIDADE_TITULOS > 0) {
      summary.DIAS_VENCIDO_MEDIO = Math.round(summary.DIAS_VENCIDO_MEDIO / summary.QUANTIDADE_TITULOS);
    }
  });
  
  // Convert to array and sort by total balance descending
  const sortedClientSummaries = Object.values(clientSummaries).sort((a, b) => 
    b.TOTAL_SALDO - a.TOTAL_SALDO
  );

  const toggleClientExpand = (clientCode: string | number) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientCode)) {
        newSet.delete(clientCode);
      } else {
        newSet.add(clientCode);
      }
      return newSet;
    });
  };

  const handleOpenCollectionDialog = (client: ClientDebtSummary) => {
    setSelectedClient(client);
    setIsMessageDialogOpen(true);
  };

  const handleCloseCollectionDialog = () => {
    setIsMessageDialogOpen(false);
    setSelectedClient(null);
  };

  const handleCollection = () => {
    if (selectedClient && onCollectionStatusChange) {
      onCollectionStatusChange(String(selectedClient.PES_CODIGO), "Cobrança realizada");
      toast({
        title: "Cobrança registrada",
        description: `A cobrança para ${selectedClient.CLIENTE_NOME} foi registrada com sucesso.`,
      });
    }
    setIsMessageDialogOpen(false);
    setSelectedClient(null);
  };

  const handleCopyText = () => {
    if (!selectedClient) return;
    
    const clientTitles = filteredTitles.filter(
      title => String(title.PES_CODIGO) === String(selectedClient.PES_CODIGO)
    );
    
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

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Código Cliente</TableHead>
              <TableHead>Nome Cliente</TableHead>
              <TableHead>Qtd. Títulos</TableHead>
              <TableHead>Dias Vencidos (máx)</TableHead>
              <TableHead>Valor Saldo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClientSummaries.map((summary) => {
              const isExpanded = expandedClients.has(summary.PES_CODIGO);
              const clientTitles = filteredTitles.filter(
                title => String(title.PES_CODIGO) === String(summary.PES_CODIGO)
              );
              const isCollected = collectedClients.includes(String(summary.PES_CODIGO));
              
              return (
                <React.Fragment key={summary.PES_CODIGO}>
                  <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => toggleClientExpand(summary.PES_CODIGO)}>
                    <TableCell>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </TableCell>
                    <TableCell>{summary.PES_CODIGO}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={summary.CLIENTE_NOME}>
                      {summary.CLIENTE_NOME}
                    </TableCell>
                    <TableCell>{summary.QUANTIDADE_TITULOS}</TableCell>
                    <TableCell className="text-amber-600 font-medium">{summary.DIAS_VENCIDO_MAXIMO} dias</TableCell>
                    <TableCell className="text-red-600 font-medium">{formatCurrency(summary.TOTAL_SALDO)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCollectionDialog(summary);
                        }}
                        className={isCollected ? "bg-green-50" : ""}
                      >
                        {isCollected ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                            Cobrado
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Realizar Cobrança
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {isExpanded && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={7} className="p-0">
                        <div className="p-4">
                          <h4 className="text-sm font-medium mb-2">Detalhes dos Títulos</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nota Fiscal</TableHead>
                                <TableHead>Nº Documento</TableHead>
                                <TableHead>Data Emissão</TableHead>
                                <TableHead>Data Vencimento</TableHead>
                                <TableHead>Dias Vencido</TableHead>
                                <TableHead>Valor Total</TableHead>
                                <TableHead>Valor Saldo</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clientTitles.map((title) => {
                                const vencimentoDate = title.DTVENCIMENTO ? new Date(title.DTVENCIMENTO) : null;
                                const diasVencido = vencimentoDate ? differenceInDays(new Date(), vencimentoDate) : 0;
                                
                                return (
                                  <TableRow key={`${title.NUMNOTA}-${title.NUMDOCUMENTO || ''}`}>
                                    <TableCell>{title.NUMNOTA}</TableCell>
                                    <TableCell>{title.NUMDOCUMENTO || '-'}</TableCell>
                                    <TableCell>{new Date(title.DTEMISSAO).toLocaleDateString()}</TableCell>
                                    <TableCell>{vencimentoDate?.toLocaleDateString() || '-'}</TableCell>
                                    <TableCell className="text-red-600">{diasVencido} dias</TableCell>
                                    <TableCell>{formatCurrency(title.VLRTITULO)}</TableCell>
                                    <TableCell className="text-red-600 font-medium">{formatCurrency(title.VLRSALDO)}</TableCell>
                                    <TableCell>
                                      {title.STATUS === '1' && 'Em Aberto'}
                                      {title.STATUS === '2' && 'Parcial'}
                                      {title.STATUS === '3' && 'Pago'}
                                      {title.STATUS === '4' && 'Cancelado'}
                                      {!['1', '2', '3', '4'].includes(title.STATUS) && title.STATUS}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Mensagem de Cobrança - {selectedClient?.CLIENTE_NOME}</AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="bg-slate-50 p-4 rounded-md my-4 text-sm relative">
            <Button 
              size="sm" 
              variant="outline" 
              className="absolute right-2 top-2" 
              onClick={handleCopyText}
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copiar
            </Button>
            
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
              
              {selectedClient && filteredTitles
                .filter(title => String(title.PES_CODIGO) === String(selectedClient.PES_CODIGO))
                .map((title, index) => {
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
                })
              }
              
              {selectedClient && (() => {
                const clientTitles = filteredTitles.filter(
                  title => String(title.PES_CODIGO) === String(selectedClient.PES_CODIGO)
                );
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
            <Button variant="outline" onClick={handleCloseCollectionDialog}>Sair</Button>
            <Button onClick={handleCollection}>Realizar Cobrança</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
