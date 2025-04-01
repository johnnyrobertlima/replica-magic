
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ReportsTable } from "@/components/bluebay_adm/reports/ReportsTable";
import { ReportsSummary } from "@/components/bluebay_adm/reports/ReportsSummary";
import { useAdmReports } from "@/hooks/bluebay/useAdmReports";

const BluebayAdmReports = () => {
  const { items, isLoading, refreshData } = useAdmReports();

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Relatório de Estoque - Local 4</h1>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <ReportsSummary items={items} />
        
        <div className="bg-white p-6 rounded-lg shadow">
          <ReportsTable items={items} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
};

export default BluebayAdmReports;
