
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SortIconProps {
  field: string;
  sortField: string;
  sortDirection: "asc" | "desc";
}

const SortIcon = ({ field, sortField, sortDirection }: SortIconProps) => {
  if (field !== sortField) return null;
  return sortDirection === "asc" ? (
    <ChevronUp className="w-4 h-4 ml-1" />
  ) : (
    <ChevronDown className="w-4 h-4 ml-1" />
  );
};

interface InvoiceTableHeaderProps {
  sortField: string;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
}

export const InvoiceTableHeader = ({
  sortField,
  sortDirection,
  handleSort,
}: InvoiceTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-10"></TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort("NOTA")}>
          <div className="flex items-center">
            Nota Fiscal <SortIcon field="NOTA" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort("DATA_EMISSAO")}>
          <div className="flex items-center">
            Data de Emissão <SortIcon field="DATA_EMISSAO" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort("CLIENTE_NOME")}>
          <div className="flex items-center">
            Cliente (PES_CODIGO) <SortIcon field="CLIENTE_NOME" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort("STATUS")}>
          <div className="flex items-center">
            Status <SortIcon field="STATUS" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="cursor-pointer text-right" onClick={() => handleSort("VALOR_NOTA")}>
          <div className="flex items-center justify-end">
            Valor <SortIcon field="VALOR_NOTA" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="text-right">Itens</TableHead>
      </TableRow>
    </TableHeader>
  );
};
