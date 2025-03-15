
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/formatters";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

interface InvoiceTableProps {
  invoices: any[];
  isLoading: boolean;
}

export const InvoiceTable = ({ invoices, isLoading }: InvoiceTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("DATA_EMISSAO");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    return (
      invoice.NOTA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(invoice.PES_CODIGO)?.includes(searchTerm)
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

  const SortIcon = ({ field }: { field: string }) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
  };

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
            placeholder="Buscar por nota ou código do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableCaption>Lista de notas fiscais</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("NOTA")}>
                <div className="flex items-center">
                  Nota Fiscal <SortIcon field="NOTA" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("DATA_EMISSAO")}>
                <div className="flex items-center">
                  Data de Emissão <SortIcon field="DATA_EMISSAO" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("PES_CODIGO")}>
                <div className="flex items-center">
                  Cliente <SortIcon field="PES_CODIGO" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("STATUS")}>
                <div className="flex items-center">
                  Status <SortIcon field="STATUS" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("VALOR_NOTA")}>
                <div className="flex items-center justify-end">
                  Valor <SortIcon field="VALOR_NOTA" />
                </div>
              </TableHead>
              <TableHead className="text-right">Itens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhuma nota fiscal encontrada
                </TableCell>
              </TableRow>
            ) : (
              sortedInvoices.map((invoice) => (
                <TableRow key={invoice.NOTA}>
                  <TableCell className="font-medium">{invoice.NOTA}</TableCell>
                  <TableCell>
                    {invoice.DATA_EMISSAO 
                      ? new Date(invoice.DATA_EMISSAO).toLocaleDateString('pt-BR') 
                      : '-'}
                  </TableCell>
                  <TableCell>{invoice.PES_CODIGO || '-'}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
