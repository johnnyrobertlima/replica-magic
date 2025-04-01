
import { useState } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { ReportsTable } from "@/components/bk/reports/ReportsTable";
import { useBluebayAdmReports } from "@/hooks/bluebay_adm/useBluebayAdmReports";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

const BluebayAdmReports = () => {
  const { 
    isLoading, 
    items, 
    dateRange, 
    updateDateRange,
    loadItemDetails,
    selectedItemDetails,
    isLoadingDetails
  } = useBluebayAdmReports();

  // Handler para quando um item é clicado na tabela
  const handleItemClick = (itemCode: string) => {
    loadItemDetails(itemCode);
  };

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-4 md:mb-0">Relatórios de Itens</h1>
            <DatePickerWithRange 
              dateRange={{
                from: dateRange.startDate,
                to: dateRange.endDate
              }}
              onDateRangeChange={(range) => {
                updateDateRange({
                  startDate: range.from,
                  endDate: range.to
                });
              }}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">Carregando dados...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-lg text-gray-700">
                  Nenhum dado encontrado para o período selecionado.
                </p>
              </div>
            ) : (
              <ReportsTable 
                items={items}
                isLoading={isLoading}
                onItemClick={handleItemClick}
                selectedItemDetails={selectedItemDetails}
                isLoadingDetails={isLoadingDetails}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default BluebayAdmReports;
