
import React, { useState } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { TitleTable } from "@/components/bk/financial/TitleTable";
import { InvoiceTable } from "@/components/bk/financial/InvoiceTable";
import { FinancialDashboard } from "@/components/bk/financial/FinancialDashboard";
import { useFinancial, DateRange } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { RefreshCw, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialSummaryCards } from "@/components/bk/financial/FinancialSummaryCards";
import { AdditionalFilters } from "@/components/bk/financial/AdditionalFilters";
import { Link } from "react-router-dom";

export const BkFinanceiroManager = () => {
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
    financialSummary
  } = useFinancial();

  const [activeTab, setActiveTab] = useState("titles");

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
          
          <Tabs defaultValue="titles" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="titles">Títulos Financeiros</TabsTrigger>
              <TabsTrigger value="invoices">Notas Fiscais</TabsTrigger>
            </TabsList>
            
            <TabsContent value="titles" className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Títulos Financeiros</h2>
              <TitleTable titles={filteredTitles} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="invoices" className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Notas Fiscais</h2>
              <InvoiceTable invoices={filteredInvoices} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BkFinanceiroManager;
