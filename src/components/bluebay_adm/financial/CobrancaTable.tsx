
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialTitle, ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";
import { useToast } from "@/components/ui/use-toast";
import { ClientDetailedTitles } from "./cobranca/ClientDetailedTitles";
import { CollectionMessageDialog } from "./cobranca/CollectionMessageDialog";
import { ClientSummaryRow } from "./cobranca/ClientSummaryRow";
import { calculateClientSummaries, sortClientSummaries, filterOverdueUnpaidTitles } from "./cobranca/utils/debtSummaryUtils";

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

  // Filter only overdue unpaid titles
  const overdueUnpaidTitles = filterOverdueUnpaidTitles(titles);

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
  const clientSummaries = calculateClientSummaries(filteredTitles);
  
  // Convert to array and sort by total balance descending
  const sortedClientSummaries = sortClientSummaries(clientSummaries);

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
                  <ClientSummaryRow
                    isExpanded={isExpanded}
                    summary={summary}
                    isCollected={isCollected}
                    onToggleExpand={() => toggleClientExpand(summary.PES_CODIGO)}
                    onOpenCollectionDialog={() => handleOpenCollectionDialog(summary)}
                  />
                  
                  {isExpanded && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={7} className="p-0">
                        <ClientDetailedTitles clientTitles={clientTitles} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedClient && (
        <CollectionMessageDialog
          isOpen={isMessageDialogOpen}
          onClose={handleCloseCollectionDialog}
          selectedClient={selectedClient}
          clientTitles={filteredTitles.filter(
            title => String(title.PES_CODIGO) === String(selectedClient.PES_CODIGO)
          )}
          onCollectionConfirm={handleCollection}
        />
      )}
    </>
  );
};
