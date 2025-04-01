
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { ReportsTable } from "@/components/bluebay_adm/reports/ReportsTable";
import { ReportsSummary } from "@/components/bluebay_adm/reports/ReportsSummary";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/bluebay/useReports";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

const BluebayAdmReports = () => {
  const { items, loading, error } = useReports();

  const handleExportToExcel = () => {
    if (items.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(
      items.map(item => ({
        'Código': item.ITEM_CODIGO,
        'Descrição': item.DESCRICAO,
        'Grupo': item.GRU_DESCRICAO
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Itens');
    
    // Generate filename with current date
    const date = new Date();
    const filename = `relatorio_bluebay_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  };

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Relatórios Bluebay</h1>
            
            <Button
              onClick={handleExportToExcel}
              variant="outline"
              disabled={items.length === 0 || loading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-6 rounded-lg text-destructive">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <ReportsSummary items={items} />
              </div>
              
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Listagem de Itens (CENTROCUSTO = BLUEBAY)
                  </h2>
                  <ReportsTable items={items} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default BluebayAdmReports;
