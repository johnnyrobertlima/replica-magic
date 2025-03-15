
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/formatters";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { fetchInvoiceItems } from "@/services/bk/financialService";
import { InvoiceTableHeader } from "./InvoiceTableHeader";
import { InvoiceItemsTable } from "./InvoiceItemsTable";

interface InvoiceItem {
  NOTA: string;
  QUANTIDADE: number | null;
  VALOR_UNITARIO: number | null;
  ITEM_CODIGO: string | null;
}

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
      invoice.CLIENTE_NOME?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nota ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableCaption>Lista de notas fiscais</TableCaption>
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
                    <TableCell>{invoice.CLIENTE_NOME || '-'}</TableCell>
                    <TableCell>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        invoice.STATUS === 'Concluído' ? 'bg-green-100 text-green-800' :
                        invoice.STATUS === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.STATUS === 'Cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.STATUS || 'Desconhecido'}
                      </div>
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
