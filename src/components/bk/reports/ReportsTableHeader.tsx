
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

interface ReportsTableHeaderProps {
  sortField: string;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
}

export const ReportsTableHeader = ({
  sortField,
  sortDirection,
  handleSort,
}: ReportsTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-10"></TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort("ITEM_CODIGO")}>
          <div className="flex items-center">
            Código do Item <SortIcon field="ITEM_CODIGO" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => handleSort("DESCRICAO")}>
          <div className="flex items-center">
            Descrição <SortIcon field="DESCRICAO" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="cursor-pointer text-right" onClick={() => handleSort("TOTAL_QUANTIDADE")}>
          <div className="flex items-center justify-end">
            Quantidade Total <SortIcon field="TOTAL_QUANTIDADE" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="cursor-pointer text-right" onClick={() => handleSort("TOTAL_VALOR")}>
          <div className="flex items-center justify-end">
            Valor Total <SortIcon field="TOTAL_VALOR" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="cursor-pointer text-right" onClick={() => handleSort("OCORRENCIAS")}>
          <div className="flex items-center justify-end">
            Ocorrências <SortIcon field="OCORRENCIAS" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
