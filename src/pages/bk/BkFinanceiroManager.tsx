
import React, { useState } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { TitleTable } from "@/components/bk/financial/TitleTable";
import { InvoiceTable } from "@/components/bk/financial/InvoiceTable";
import { FinancialDashboard } from "@/components/bk/financial/FinancialDashboard";
import { useFinancial, DateRange } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { RefreshCw, Users, FileSpreadsheet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialSummaryCards } from "@/components/bk/financial/FinancialSummaryCards";
import { AdditionalFilters } from "@/components/bk/financial/AdditionalFilters";
import { Link } from "react-router-dom";
import { ClientFinancialTable } from "@/components/bk/financial/ClientFinancialTable";
import { exportToExcelWithSections } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";

export const BkFinanceiroManager = () => {
  const { toast } = useToast();
  
  const { 
    isLoading, 
    consolidatedInvoices, 
    filteredInvoices,
    financialTitles,
    filteredTitles,
    refreshData, 
    dateRange, 
    updateDateRange,
    statusFilter,
    updateStatusFilter,
    availableStatuses,
    clientFilter,
    updateClientFilter,
    notaFilter,
    updateNotaFilter,
    financialSummary,
    clientFinancialSummaries
  } = useFinancial();

  const [activeTab, setActiveTab] = useState("titles");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Filter titles by selected client if one is selected
  const clientFilteredTitles = selectedClient 
    ? filteredTitles.filter(title => String(title.PES_CODIGO) === selectedClient)
    : filteredTitles;

  const handleClientSelect = (clientCode: string) => {
    setSelectedClient(clientCode);
    setActiveTab("titles"); // Switch to titles tab to show client's titles
  };

  const handleResetClientSelection = () => {
    setSelectedClient(null);
  };

  // Function to handle Excel export
  const handleExportToExcel = () => {
    try {
      let data = [];
      let fileName = 'relatorio-financeiro';
      
      switch (activeTab) {
        case 'titles':
          // Prepare titles data for export
          data = clientFilteredTitles.map(title => ({
            'Nota': title.NUMNOTA || '',
            'Cliente': title.CLIENTE_NOME || '',
            'Data Emissão': title.DTEMISSAO || '',
            'Data Vencimento': title.DTVENCIMENTO || '',
            'Data Pagamento': title.DTPAGTO || '',
            'Valor Título': title.VLRTITULO || 0,
            'Valor Desconto': title.VLRDESCONTO || 0,
            'Valor Saldo': title.VLRSALDO || 0,
            'Status': title.STATUS || ''
          });
          fileName = `titulos-financeiros-${new Date().toISOString().split('T')[0]}`;
          break;
          
        case 'invoices':
          // Prepare invoices data for export
          data = filteredInvoices.map(invoice => ({
            'Nota Fiscal': invoice.NUMNOTA || '',
            'Cliente': invoice.CLIENTE_NOME || '',
            'Data Emissão': invoice.DTEMISSAO || '',
            'Valor Total': invoice.VLRTOTAL || 0,
            'Status': invoice.STATUS || ''
          }));
          fileName = `notas-fiscais-${new Date().toISOString().split('T')[0]}`;
          break;
          
        case 'clients':
          // Prepare client summary data for export
          data = clientFinancialSummaries.map(client => ({
            'Código': client.PES_CODIGO,
            'Cliente': client.CLIENTE_NOME,
            'Valores Vencidos': client.totalValoresVencidos,
            'Valores Pagos': client.totalPago,
            'Valores em Aberto': client.totalEmAberto
          }));
          fileName = `resumo-clientes-${new Date().toISOString().split('T')[0]}`;
          break;
      }
      
      // Export the data to Excel
      if (data.length > 0) {
        exportToExcelWithSections(
          [], // No header data
          data, 
          fileName
        );
        
        toast({
          title: "Exportação Concluída",
          description: `${data.length} registros exportados com sucesso.`,
        });
      } else {
        toast({
          title: "Nenhum dado para exportar",
          description: "Aplique filtros diferentes ou atualize os dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Gerenciamento Financeiro</h1>
          <div className="flex gap-2">
            <Link to="/client-area/bk/clientefinancial">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Visão por Cliente
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleExportToExcel} 
              disabled={isLoading || (
                (activeTab === 'titles' && clientFilteredTitles.length === 0) || 
                (activeTab === 'invoices' && filteredInvoices.length === 0) || 
                (activeTab === 'clients' && clientFinancialSummaries.length === 0)
              )}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button variant="outline" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
  
        <div className="mt-6 space-y-6">
          {/* Indicadores Financeiros */}
          <FinancialSummaryCards 
            totalValoresVencidos={financialSummary.totalValoresVencidos}
            totalPago={financialSummary.totalPago}
            totalEmAberto={financialSummary.totalEmAberto}
          />
          
          <div className="flex flex-wrap justify-between gap-4 mb-4 items-start">
            <div className="space-y-4 w-full md:w-auto">
              <StatusFilter 
                selectedStatus={statusFilter} 
                onStatusChange={updateStatusFilter}
                statuses={availableStatuses}
              />
              <AdditionalFilters 
                clientFilter={clientFilter}
                onClientFilterChange={updateClientFilter}
                notaFilter={notaFilter}
                onNotaFilterChange={updateNotaFilter}
              />
            </div>
            
            <DateRangePicker 
              startDate={dateRange.startDate} 
              endDate={dateRange.endDate} 
              onUpdate={updateDateRange}
              label="Período de Vencimento"
            />
          </div>
          
          {selectedClient && (
            <div className="flex items-center mb-4">
              <div className="px-4 py-2 bg-blue-100 border rounded-md flex items-center">
                <span className="font-medium mr-2">Cliente selecionado</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetClientSelection}
                  className="h-6 text-blue-600 hover:text-blue-800"
                >
                  Limpar seleção
                </Button>
              </div>
            </div>
          )}
          
          <Tabs 
            defaultValue="titles" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="titles">Títulos Financeiros</TabsTrigger>
              <TabsTrigger value="invoices">Notas Fiscais</TabsTrigger>
              <TabsTrigger value="clients">Clientes</TabsTrigger>
            </TabsList>
            
            <TabsContent 
              value="titles" 
              className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">
                {selectedClient 
                  ? `Títulos Financeiros do Cliente` 
                  : `Títulos Financeiros`}
              </h2>
              <TitleTable titles={clientFilteredTitles} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent 
              value="invoices" 
              className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">Notas Fiscais</h2>
              <InvoiceTable invoices={filteredInvoices} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent 
              value="clients" 
              className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">Clientes - Resumo Financeiro</h2>
              <ClientFinancialTable 
                clients={clientFinancialSummaries} 
                isLoading={isLoading} 
                onClientSelect={handleClientSelect}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BkFinanceiroManager;
