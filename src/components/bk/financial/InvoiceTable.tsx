import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { ChevronDown, ChevronRight } from "lucide-react";
import { fetchInvoiceItems } from "@/services/bk/financialService";
import { InvoiceTableHeader } from "./InvoiceTableHeader";
import { InvoiceItemsTable } from "./InvoiceItemsTable";
import { StatusBadge } from "./StatusBadge";
import { SearchBar } from "./SearchBar";
import { InvoiceItem } from "@/services/bk/types/financialTypes";

interface InvoiceTableProps {
  invoices: any[];
  isLoading: boolean;
}

export const InvoiceTable = ({ invoices, isLoading }: InvoiceTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("DATA_EMISSAO");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleInvoiceClick = async (nota: string) => {
    if (selectedInvoice === nota) {
      setSelectedInvoice(null);
      setInvoiceItems([]);
      return;
    }

    setSelectedInvoice(nota);
    setIsLoadingItems(true);
    
    try {
      const items = await fetchInvoiceItems(nota);
      setInvoiceItems(items);
    } catch (error) {
      console.error("Error fetching invoice items:", error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    return (
      invoice.NOTA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.CLIENTE_NOME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(invoice.PES_CODIGO).includes(searchTerm)
    );
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortField === "DATA_EMISSAO") {
      const dateA = a.DATA_EMISSAO ? new Date(a.DATA_EMISSAO).getTime() : 0;
      const dateB = b.DATA_EMISSAO ? new Date(b.DATA_EMISSAO).getTime() : 0;
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    if (sortField === "VALOR_NOTA") {
      const valueA = a.VALOR_NOTA || 0;
      const valueB = b.VALOR_NOTA || 0;
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }
    
    // Default string comparison
    const valueA = a[sortField] || "";
    const valueB = b[sortField] || "";
    return sortDirection === "asc" 
      ? valueA.localeCompare(valueB) 
      : valueB.localeCompare(valueA);
  });

  if (isLoading) {
    return (
      <div className="w-full py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por nota ou cliente..."
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableCaption>Lista de notas fiscais - Total: {sortedInvoices.length}</TableCaption>
          <InvoiceTableHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
          <TableBody>
            {sortedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Nenhuma nota fiscal encontrada
                </TableCell>
              </TableRow>
            ) : (
              sortedInvoices.map((invoice) => (
                <React.Fragment key={invoice.NOTA}>
                  <TableRow 
                    className={selectedInvoice === invoice.NOTA ? "bg-muted" : "cursor-pointer"}
                    onClick={() => handleInvoiceClick(invoice.NOTA)}
                  >
                    <TableCell>
                      {selectedInvoice === invoice.NOTA ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </TableCell>
                    <TableCell className="font-medium">{invoice.NOTA}</TableCell>
                    <TableCell>
                      {invoice.DATA_EMISSAO 
                        ? new Date(invoice.DATA_EMISSAO).toLocaleDateString('pt-BR') 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {invoice.CLIENTE_NOME || '-'} 
                      {invoice.PES_CODIGO && (
                        <span className="ml-1 text-sm text-muted-foreground">
                          (Cód: {invoice.PES_CODIGO})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.STATUS} />
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.VALOR_NOTA ? formatCurrency(invoice.VALOR_NOTA) : '-'}
                    </TableCell>
                    <TableCell className="text-right">{invoice.ITEMS_COUNT}</TableCell>
                  </TableRow>
                  {selectedInvoice === invoice.NOTA && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30 p-0">
                        <div className="px-4 py-2">
                          <h4 className="font-medium mb-2">Itens da Nota {invoice.NOTA}</h4>
                          <InvoiceItemsTable 
                            invoiceItems={invoiceItems}
                            isLoadingItems={isLoadingItems}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
