
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EstoqueItem } from '@/types/bk/estoque';

interface ReportsTableProps {
  items: EstoqueItem[];
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum item encontrado com CENTROCUSTO = BLUEBAY</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Grupo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.ITEM_CODIGO}>
              <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
              <TableCell>{item.DESCRICAO}</TableCell>
              <TableCell>{item.GRU_DESCRICAO}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
